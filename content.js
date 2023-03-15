// constants --start
const elBrainDrawerID = "hey-brain-drawer";
const elBrainRootID = "hey-brain-root";
const elBrainRootTabsID = "hey-brain-root-tabs";
const elBrainContentID = "hey-brain-content";
const elBrainLoaderID = "hey-brain-loader";
const kBrainRootHeight = 475;
const tabFirstItemID = "hey-brain-root-tab-item-first";
const tabSecondItemID = "hey-brain-root-tab-item-second";
const tabThirdItemID = "hey-brain-root-tab-item-third";
// constants --end

var accessToken = "";
var pageData = null;
var pageSmartPast = [];
var pageTagsSuggestions = [];
var pageTagsRecommendations = [];

// helpers --start

const metaSelector = (name) => {
  if (!name) {
    return null;
  }
  if (document.querySelector(name)) {
    return document.querySelector(name);
  }
  return null;
};

/**
 * Returns the content of a meta tag
 *
 * @param {string} selector
 * @returns {string} content of the meta tag
 */
const getMetaContent = (selector) => {
  if (!selector) {
    return "";
  }

  if (document.querySelector(selector)) {
    return document.querySelector(selector).getAttribute("content");
  }

  return "";
};

const pageInfo = () => {
  const description =
    getMetaContent('meta[name="description"]') ||
    getMetaContent('meta[property="og:description"]') ||
    getMetaContent('meta[property="twitter:description"]');

  return {
    title: document.title,
    url: window.location.href,
    description: description,
    domain: window.location.hostname,
  };
};
// helpers --end

// init --start
const init = () => {
  // brain drawer --start
  if (document.getElementById("hey-brain-drawer") === null) {
    let elBrainDrawer = document.createElement("div");
    elBrainDrawer.id = elBrainDrawerID;
    elBrainDrawer.classList.add("hey-brain-main");
    elBrainDrawer.style.position = "fixed";
    elBrainDrawer.style.bottom = kBrainRootHeight - 40 + "px";
    elBrainDrawer.style.right = "-36px";
    elBrainDrawer.style.width = "80px";
    elBrainDrawer.style.height = "80px";
    elBrainDrawer.style.zIndex = "99999";
    elBrainDrawer.style.cursor = "pointer";
    elBrainDrawer.onclick = () => {
      let elBrainRoot = document.getElementById(elBrainRootID);
      if (elBrainRoot.style.transform === "translateX(100%)") {
        elBrainRoot.style.transform = "translateX(0%)";
        document.getElementById("brain-drawer-no-hands-image").style.display =
          "none";
        document.getElementById("brain-drawer-image").style.display = "initial";
      } else {
        elBrainRoot.style.transform = "translateX(100%)";
        document.getElementById("brain-drawer-no-hands-image").style.display =
          "initial";
        document.getElementById("brain-drawer-image").style.display = "none";
      }
    };

    let elBrainDrawerImage = document.createElement("img");
    elBrainDrawerImage.src = chrome.runtime.getURL(
      "assets/icons/brain-drawer-160.png"
    );
    elBrainDrawerImage.setAttribute("id", "brain-drawer-image");
    elBrainDrawerImage.style.width = "80px";
    elBrainDrawerImage.style.height = "80px";
    elBrainDrawerImage.style.display = "none";
    elBrainDrawer.appendChild(elBrainDrawerImage);

    let elBrainDrawerNoHandsImage = document.createElement("img");
    elBrainDrawerNoHandsImage.src = chrome.runtime.getURL(
      "assets/icons/brain-drawer-no-hands.png"
    );
    elBrainDrawerNoHandsImage.style.width = "73px";
    elBrainDrawerNoHandsImage.style.height = "62.5px";
    elBrainDrawerNoHandsImage.style.position = "absolute";
    elBrainDrawerNoHandsImage.style.top = "0px";
    elBrainDrawerNoHandsImage.style.right = "0px";
    elBrainDrawerNoHandsImage.style.display = "initial";
    elBrainDrawerNoHandsImage.setAttribute("id", "brain-drawer-no-hands-image");
    elBrainDrawerNoHandsImage.style.transition = "all 0.5s ease-in-out";
    elBrainDrawer.appendChild(elBrainDrawerNoHandsImage);

    document.body.appendChild(elBrainDrawer);
    // brain drawer --end
  }
  // const metadata = await fetchMetadata(sender.tab.url);
  // sendResponse(metadata);

  // brain root --start
  let elBrainRoot = document.createElement("div");
  elBrainRoot.id = elBrainRootID;
  elBrainRoot.classList.add("hey-brain-main");
  elBrainRoot.style.position = "fixed";
  elBrainRoot.style.bottom = "0";
  elBrainRoot.style.right = "0";
  elBrainRoot.style.width = "100%";
  elBrainRoot.style.height = "100%";
  elBrainRoot.style.zIndex = "99998";
  elBrainRoot.style.backgroundColor = "rgba(243, 243, 243, 0.8)";
  elBrainRoot.style.backdropFilter = "blur(10px)";
  elBrainRoot.style.border = "1px solid rgba(200, 200, 200, 0.4)";
  elBrainRoot.style.borderRightWidth = "0";
  elBrainRoot.style.display = "flex";
  elBrainRoot.style.borderBottomLeftRadius = "20px";
  elBrainRoot.style.borderTopLeftRadius = "20px";
  elBrainRoot.style.padding = "20px";
  elBrainRoot.style.boxSizing = "border-box";
  elBrainRoot.style.alignItems = "center";
  elBrainRoot.style.justifyContent = "center";
  elBrainRoot.style.height = kBrainRootHeight + "px";
  elBrainRoot.style.width = "375px";
  elBrainRoot.style.transition = "all 0.3s ease-in-out";
  elBrainRoot.style.transform = "translateX(100%)";
  elBrainRoot.style.fontFamily = "sans-serif";
  elBrainRoot.style.fontSize = "16px";
  elBrainRoot.style.color = "#000";
  // brain root --end

  // brain root dismiss button --start
  let elBrainRootDismissButton = document.createElement("div");
  elBrainRootDismissButton.style.position = "absolute";
  elBrainRootDismissButton.style.top = "-10px";
  elBrainRootDismissButton.style.left = "-10px";
  elBrainRootDismissButton.style.width = "32px";
  elBrainRootDismissButton.style.height = "32px";
  elBrainRootDismissButton.style.zIndex = "99999";
  elBrainRootDismissButton.style.cursor = "pointer";
  elBrainRootDismissButton.onclick = () => {
    elBrainRoot.style.transform = "translateX(100%)";
    document.getElementById("brain-drawer-no-hands-image").style.display =
      "initial";
    document.getElementById("brain-drawer-image").style.display = "none";
  };

  let elBrainRootDismissButtonImage = document.createElement("img");
  elBrainRootDismissButtonImage.src = chrome.runtime.getURL(
    "assets/images/drawer-dismiss.png"
  );
  elBrainRootDismissButtonImage.style.width = "32px";
  elBrainRootDismissButtonImage.style.height = "32px";
  elBrainRootDismissButton.appendChild(elBrainRootDismissButtonImage);
  elBrainRoot.appendChild(elBrainRootDismissButton);
  // brain root dismiss button --end

  // brain content --start
  let elBrainContent = document.createElement("div");
  elBrainContent.id = elBrainContentID;
  elBrainContent.style.position = "relative";
  elBrainContent.style.width = "100%";
  elBrainContent.style.height = "100%";
  elBrainContent.style.zIndex = "99999";
  elBrainContent.style.overflowY = "auto";
  elBrainContent.style.overflowX = "hidden";
  elBrainRoot.appendChild(elBrainContent);
  // brain content --end

  // brain root tabs --start
  const tabItemHeight = 32;
  const tabItemDeactiveBackground = "#0A0458";

  let elBrainRootTabs = document.createElement("div");
  elBrainRootTabs.id = elBrainRootTabsID;
  elBrainRootTabs.style.position = "absolute";
  elBrainRootTabs.style.top = -tabItemHeight - 1 + "px"; // 1px border
  elBrainRootTabs.style.left = "0";
  elBrainRootTabs.style.width = "100%";
  elBrainRootTabs.style.height = tabItemHeight + "px";
  elBrainRootTabs.style.zIndex = "99999";
  elBrainRootTabs.style.display = "flex";
  elBrainRootTabs.style.flexDirection = "row";
  elBrainRootTabs.style.alignItems = "center";
  elBrainRootTabs.style.justifyContent = "center";
  elBrainRootTabs.style.boxSizing = "border-box";
  elBrainRoot.appendChild(elBrainRootTabs);

  // brain root tab first --start
  let elBrainRootTabItemFirst = createTabItem(tabFirstItemID, "SMARTPAST");
  elBrainRootTabItemFirst.style.height = tabItemHeight + "px";
  elBrainRootTabItemFirst.style.backgroundColor = "rgba(243, 243, 243, 0.8)";
  elBrainRootTabItemFirst.style.color = tabItemDeactiveBackground;
  elBrainRootTabItemFirst.onclick = () => {
    selectTabItem(tabFirstItemID);
  };
  elBrainRootTabs.appendChild(elBrainRootTabItemFirst);
  // brain root tab first --end

  // brain root tab second --start
  let elBrainRootTabItemSecond = createTabItem(tabSecondItemID, "TAGS");
  elBrainRootTabItemSecond.style.height = tabItemHeight + "px";
  elBrainRootTabItemSecond.style.backgroundColor = tabItemDeactiveBackground;
  elBrainRootTabItemSecond.style.color = "#fff";
  elBrainRootTabItemSecond.style.marginLeft = "8px";
  elBrainRootTabItemSecond.style.marginRight = "8px";
  elBrainRootTabItemSecond.onclick = () => {
    selectTabItem(tabSecondItemID);
  };
  elBrainRootTabs.appendChild(elBrainRootTabItemSecond);
  // brain root tab second --end

  // brain root tab second --third
  let elBrainRootTabItemThird = createTabItem(tabThirdItemID, "NOTES");
  elBrainRootTabItemThird.style.height = tabItemHeight + "px";
  elBrainRootTabItemThird.style.backgroundColor = tabItemDeactiveBackground;
  elBrainRootTabItemThird.style.color = "#fff";
  elBrainRootTabItemThird.onclick = () => {
    selectTabItem(tabThirdItemID);
  };
  elBrainRootTabs.appendChild(elBrainRootTabItemThird);
  // brain root tab second --third

  document.body.appendChild(elBrainRoot);

  // load page data --start
  elBrainRootTabs.style.display = "none";
  elBrainContent.style.display = "none";

  let elBrainLoader = document.createElement("div");
  elBrainLoader.id = elBrainLoaderID;
  elBrainLoader.style.position = "absolute";
  elBrainLoader.style.top = "0";
  elBrainLoader.style.left = "0";
  elBrainLoader.style.width = "100%";
  elBrainLoader.style.height = "100%";
  elBrainLoader.style.zIndex = "99999";
  elBrainLoader.style.display = "flex";
  elBrainLoader.style.flexDirection = "column";
  elBrainLoader.style.alignItems = "center";
  elBrainLoader.style.justifyContent = "center";
  elBrainLoader.style.boxSizing = "border-box";
  elBrainLoader.style.fontSize = "16px";
  elBrainLoader.style.fontWeight = "regular";
  elBrainLoader.innerText = "Loading...";
  elBrainRoot.appendChild(elBrainLoader);

  chrome.runtime.sendMessage(
    {
      action: "get-url-data",
      data: {
        access_token: accessToken,
        page_description: pageInfo().description,
        domain: pageInfo().domain,
      },
    },
    (response) => {
      elBrainRootTabs.style.display = "flex";
      elBrainContent.style.display = "block";
      elBrainLoader.style.display = "none";
      if (response) {
        pageData = response;
        console.log("pageData", pageData);
        if (!pageData.favicon_url) {
          pageData.favicon_url =
            "https://www.google.com/s2/favicons?domain=" +
            pageData.url +
            "&sz=64";
        }
        selectTabItem(tabFirstItemID);
        if (!pageData.screenshot_url || pageData.screenshot_url.length === 0) {
          chrome.runtime.sendMessage(
            {
              action: "save-screenshot",
              data: {
                access_token: accessToken,
                id: pageData.id,
              },
            },
            (response) => {}
          );
        }

        if (pageData.tags.length > 0 || pageData.notes.length > 0) {
          let elBrainDrawerNoHandsImageWithMarker = document.getElementById(
            "brain-drawer-no-hands-image"
          );
          elBrainDrawerNoHandsImageWithMarker.src = chrome.runtime.getURL(
            "assets/icons/brain-with-marker.png"
          );
          elBrainDrawerNoHandsImageWithMarker.style.width = "80px";
          elBrainDrawerNoHandsImageWithMarker.style.height = "67px";
          elBrainDrawerNoHandsImageWithMarker.style.top = "0px";
          elBrainDrawerNoHandsImageWithMarker.style.right = "10px";
        }
      }
    }
  );
  // load page data --end
};
// init --end

// tab related actions --start
const createTabItem = (id, title) => {
  let tabItem = document.createElement("div");
  tabItem.id = id;
  tabItem.style.position = "relative";
  tabItem.style.borderTopLeftRadius = "8px";
  tabItem.style.borderTopRightRadius = "8px";
  tabItem.style.border = "1px solid rgba(200, 200, 200, 0.4)";
  tabItem.style.borderBottomWidth = "0";
  tabItem.style.backdropFilter = "blur(10px)";
  tabItem.innerHTML = title;
  tabItem.style.fontSize = "14px";
  tabItem.style.fontWeight = "bold";
  tabItem.style.display = "flex";
  tabItem.style.alignItems = "center";
  tabItem.style.justifyContent = "center";
  tabItem.style.cursor = "pointer";
  tabItem.style.padding = "0px 12px";
  return tabItem;
};

const selectTabItem = (tabID) => {
  let elTabItem = document.getElementById(tabID);
  let elTabItemContainer = document.getElementById(elBrainRootTabsID);
  let elTabItemContainerChildren = elTabItemContainer.children;
  for (let i = 0; i < elTabItemContainerChildren.length; i++) {
    elTabItemContainerChildren[i].style.backgroundColor = "#0A0458";
    elTabItemContainerChildren[i].style.color = "#fff";
  }
  elTabItem.style.backgroundColor = "rgba(243, 243, 243, 0.8)";
  elTabItem.style.color = "#0A0458";
  document.getElementById(elBrainLoaderID).style.display = "none";

  if (document.getElementById(elBrainContentID + "-tags-content-input")) {
    // remove input enter key listener
    document
      .getElementById(elBrainContentID + "-tags-content-input")
      .removeEventListener("keydown", tagInputKeydown);
    document
      .getElementById(elBrainContentID + "-tags-content-input")
      .removeEventListener("keyup", tagInputKeyup);
    document
      .getElementById(elBrainContentID + "-tags-content-tag-input-clear")
      .removeEventListener("click", onResetTagInput, false);

    // remove tag item remove click listener
    if (document.getElementsByClassName("remove-tag-item").length > 0) {
      Array.from(document.getElementsByClassName("remove-tag-item")).forEach(
        (el) => {
          el.removeEventListener("click", removeTag, false);
        }
      );
    }
  }

  if (document.getElementById(elBrainContentID + "-notes-save-content")) {
    document
      .getElementById(elBrainContentID + "-notes-save-button")
      .removeEventListener("click", saveNotes, false);
  }

  if (tabID === tabFirstItemID) {
    createSmartpastContent();
  } else if (tabID === tabSecondItemID) {
    createTagsContent();
  } else if (tabID === tabThirdItemID) {
    createNotesContent();
  }
};
// tab related actions --end

// tab content related actions --start

// tab smartpast content --start
const createSmartpastContent = () => {
  let tabContent = document.createElement("div");
  tabContent.id = elBrainContentID + "-smartpast-content";
  tabContent.style.position = "relative";
  tabContent.style.display = "flex";
  tabContent.style.flexDirection = "column";
  tabContent.style.width = "100%";
  tabContent.style.height = "100%";
  tabContent.innerHTML = "";
  document.getElementById(elBrainContentID).innerHTML = "";
  document.getElementById(elBrainContentID).appendChild(tabContent);

  document.getElementById(elBrainLoaderID).style.display = "flex";
  chrome.runtime.sendMessage(
    {
      action: "get-smartpast",
      data: {
        access_token: accessToken,
        id: pageData.id,
        is_new: pageData.is_new,
        text: pageData.title,
        limit: 10,
      },
    },
    (response) => {
      document.getElementById(elBrainLoaderID).style.display = "none";
      if (response) {
        pageSmartPast = response;

        let smartPastContentEl = document.getElementById(
          elBrainContentID + "-smartpast-content"
        );
        if (smartPastContentEl) {
          pageSmartPast.forEach((item) => {
            if (!item.favicon_url) {
              item.favicon_url =
                "https://www.google.com/s2/favicons?domain=" +
                item.url +
                "&sz=64";
            }

            let elSmartpastItem = document.createElement("div");
            elSmartpastItem.style.position = "relative";
            elSmartpastItem.style.border = "1px solid rgba(200, 200, 200, 0.4)";
            elSmartpastItem.style.borderRadius = "12px";
            elSmartpastItem.style.margin = "8px";
            elSmartpastItem.style.padding = "8px";
            elSmartpastItem.style.display = "flex";
            elSmartpastItem.style.flexDirection = "column";
            elSmartpastItem.style.justifyContent = "space-between";
            elSmartpastItem.style.cursor = "pointer";
            elSmartpastItem.style.boxSizing = "border-box";
            elSmartpastItem.style.backgroundColor = "white";
            elSmartpastItem.onclick = () => {
              window.open(item.url, "_blank");
            };

            const favIcon = `
              <div style="width:32px;min-width:32px;">
                <img src="${item.favicon_url}" width="24" height="24" />
              </div>
            `;

            const title =
              item.title.length > 75
                ? item.title.substring(0, 75) + "..."
                : item.title;

            const screenshot_url = item.screenshot_url
              ? item.screenshot_url
              : item.favicon_url;
            const blur_effect = !item.screenshot_url
              ? "style='filter: blur(6px);max-height: 140px;object-fit: contain; margin: auto;'"
              : "";
            const screenshot = `<img src="${screenshot_url}" width="100%" height="140px" ${blur_effect}>`;

            const descriptionImgSrc = chrome.runtime.getURL(
              "assets/images/description.png"
            );

            var descriptionText =
              item.description && item.description.length > 0
                ? item.description
                : item.title;

            descriptionText =
              descriptionText.length > 150
                ? descriptionText.substring(0, 150) + "..."
                : descriptionText;

            const descriptionContent = `
              <div class="flex flex-row w-full p-1 space-x-2" style="font-size:12px;">
                <div class="shrink-0"><img src="${descriptionImgSrc}" width="24px" height="24px" /></div>
                <div>${descriptionText}</div>
              </div>
            `;

            var dateContent = "";

            if (item.__timestamp) {
              const date = new Date(item.__timestamp);
              const dateStr =
                date.getDate() +
                "/" +
                (date.getMonth() + 1) +
                "/" +
                date.getFullYear() +
                " " +
                date.getHours() +
                ":" +
                date.getMinutes();
              dateContent =
                `<div style="margin-left:32px;font-size:12px;opacity:0.5;">` +
                dateStr +
                `</div>`;
            }

            let domain = item.domain;
            let url = item.url;

            // replace www. with empty string if www. only occurs once
            // once because there might be such domain: "www.examplewww.com"
            if (domain && domain.split("www.").length === 2) {
              domain = domain.replace("www.", "");
            }

            if (domain && url) {
              domain = url.split("//")[0] + "//" + domain;
            }

            elSmartpastItem.innerHTML =
              `
              <div style="position: relative; display: flex; flex-direction: column; justify-content: space-between; font-size: 16px;" class="space-y-4">
              <div class="flex flex-col">
                <div class="flex flex-row space-x-2">
                ` +
              favIcon +
              `
                    <div class="font-semibold">` +
              title +
              `
                    </div>
                  </div>
                  <div style="margin-left:40px;font-size:12px;opacity:0.5;">` +
              domain +
              `</div>
                </div>
                ` +
              screenshot +
              `  
              ` +
              descriptionContent +
              `
              ` +
              dateContent +
              `
              </div>
              `;
            smartPastContentEl.appendChild(elSmartpastItem);
          });
        }
      }
    }
  );

  // let elSmartpastContainer = document.createElement("div");
};
// tab smartpast content --end

// tab tags content --start
const createTagsContent = () => {
  let tabContent = document.createElement("div");
  tabContent.id = elBrainContentID + "-tags-content";
  tabContent.style.position = "relative";
  tabContent.style.height = "100%";
  tabContent.style.display = "flex";
  tabContent.style.flexDirection = "column";
  tabContent.className = "space-y-4";

  const favIcon = `<div><img src="${pageData.favicon_url}" width="32" height="32" /></div>`;

  const title =
    pageData.title.length > 35
      ? pageData.title.substring(0, 35) + "..."
      : pageData.title;

  tabContent.innerHTML =
    `
    <div class="flex flex-row space-x-2">
    ` +
    favIcon +
    `
        <div class="font-semibold">` +
    title +
    `
        </div>
      </div>
    <div class="flex flex-grow flex-wrap" style="align-content: baseline;" id="` +
    elBrainContentID +
    `-tags-content-active-tags-list">
    </div>
    <div class="flex">
      <div style="position:absolute;right: 20px;margin-top: 8px;font-size: 16px;cursor: pointer;display: none;" id="` +
    elBrainContentID +
    `-tags-content-tag-input-clear">
        <img src="` +
    chrome.runtime.getURL("assets/images/tag-input-clear.png") +
    `" width="24" height="24" />
      </div>
      <input type="text" id="` +
    elBrainContentID +
    `-tags-content-input" 
      class="flex-grow px-4 py-2 border border-gray-300 rounded-full" 
      style="background: white; padding-right: 50px;"
      placeholder="Add a tag" />
    </div>
    <div class="flex flex-grow flex-wrap" style="align-content: baseline;" id="` +
    elBrainContentID +
    `-tags-content-suggested">
    
    </div>
  `;

  document.getElementById(elBrainContentID).innerHTML = "";
  document.getElementById(elBrainContentID).appendChild(tabContent);
  fillTagsContent();
  document
    .getElementById(elBrainContentID + "-tags-content-input")
    .addEventListener("keydown", tagInputKeydown, false);
  document
    .getElementById(elBrainContentID + "-tags-content-input")
    .addEventListener("keyup", tagInputKeyup, false);
  document
    .getElementById(elBrainContentID + "-tags-content-tag-input-clear")
    .addEventListener("click", onResetTagInput, false);

  if (pageTagsSuggestions.length > 0) {
    fillSuggestionsContent();
  } else {
    if (document.getElementById(elBrainContentID + "-tags-content-suggested")) {
      document.getElementById(
        elBrainContentID + "-tags-content-suggested"
      ).innerHTML =
        "<p class='text-xs text-gray-500 text-center w-full'>Loading suggestions..</p>";
    }
    chrome.runtime.sendMessage(
      {
        action: "suggested-tags",
        data: {
          id: pageData.id,
          access_token: accessToken,
        },
      },
      (response) => {
        if (response) {
          Object.keys(response.response).forEach((key) => {
            var r = response.response[key];
            r.local_type = "suggested";
            pageTagsSuggestions.push(r);
          });
          let tagsContentSuggestedEl = document.getElementById(
            elBrainContentID + "-tags-content-suggested"
          );
          if (tagsContentSuggestedEl) {
            tagsContentSuggestedEl.innerHTML = "";
          }
          fillSuggestionsContent();
        }
      }
    );
  }
  loadRecommendedTags();
};

const tagInputKeydown = (e) => {
  if (e.keyCode === 13) {
    // if enter key
    const el = document.getElementById(
      elBrainContentID + "-tags-content-input"
    );
    const tag = el.value.trim();
    if (tag.length === 0) return;
    addTag(tag);
    el.value = "";
  } else {
  }
};

const tagInputKeyup = (e) => {
  if (e.keyCode === 13) {
    // if enter key
    return;
  } else {
    const el = document.getElementById(
      elBrainContentID + "-tags-content-input"
    );
    const tag = el.value.trim();
    if (tag.length === 0) {
      fillSuggestionsContent();
      document.getElementById(
        elBrainContentID + "-tags-content-tag-input-clear"
      ).style.display = "none";
      return;
    } else {
      document.getElementById(
        elBrainContentID + "-tags-content-tag-input-clear"
      ).style.display = "initial";
    }
    if (document.getElementById(elBrainContentID + "-tags-content-suggested")) {
      document.getElementById(
        elBrainContentID + "-tags-content-suggested"
      ).innerHTML =
        "<p class='text-xs text-gray-500 text-center w-full'>Loading autocomplete..</p>";
    }
    chrome.runtime.sendMessage(
      {
        action: "autocomplete-tags",
        data: {
          access_token: accessToken,
          query: tag,
        },
      },
      (response) => {
        if (response) {
          fillAutoCompleteContent(response.response);
        } else {
          if (
            document.getElementById(
              elBrainContentID + "-tags-content-suggested"
            )
          ) {
            document.getElementById(
              elBrainContentID + "-tags-content-suggested"
            ).innerHTML = "";
          }
        }
      }
    );
  }
};

const onResetTagInput = () => {
  document.getElementById(elBrainContentID + "-tags-content-input").value = "";
  fillSuggestionsContent();
  document.getElementById(
    elBrainContentID + "-tags-content-tag-input-clear"
  ).style.display = "none";
};

const addTag = (tag) => {
  const tags = pageData.tags;
  tags.push(tag);
  tags.forEach((tag) => {
    const t = tag.trim();
    if (t.length > 0 && pageData.tags.indexOf(t) === -1) {
      pageData.tags.push(t);
    }
  });
  fillTagsContent();
  document.getElementById(elBrainContentID + "-tags-content-input").value = "";
  document.getElementById(
    elBrainContentID + "-tags-content-tag-input-clear"
  ).style.display = "none";
  chrome.runtime.sendMessage(
    {
      action: "add-tags",
      data: {
        access_token: accessToken,
        id: pageData.id,
        tags: [tag],
      },
    },
    (response) => {
      if (response) {
        fillSuggestionsContent();
        loadRecommendedTags();
      }
    }
  );
};

const removeTag = (e) => {
  const el = e.target;
  const idx = el.attributes["idx"].value;
  if (idx === undefined) {
    return;
  }

  const tags = pageData.tags;
  const tag = document.getElementById("tag-item-" + idx).innerText;
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
  }
  pageData.tags = tags;
  fillTagsContent();
  chrome.runtime.sendMessage(
    {
      action: "remove-tags",
      data: {
        access_token: accessToken,
        id: pageData.id,
        tags: [tag],
      },
    },
    (response) => {
      if (response) {
        fillSuggestionsContent();
        loadRecommendedTags();
      }
    }
  );
};

const loadRecommendedTags = () => {
  if (pageData.tags.length === 0) {
    return;
  }
  chrome.runtime.sendMessage(
    {
      action: "recommended-tags",
      data: {
        id: pageData.id,
        access_token: accessToken,
      },
    },
    (response) => {
      if (response) {
        pageTagsRecommendations = [];
        Object.keys(response.response).forEach((key) => {
          var r = response.response[key];
          r.local_type = "recommended";
          pageTagsRecommendations.push(r);
        });
        fillSuggestionsContent();
      }
    }
  );
};

const fillTagsContent = () => {
  const tags = pageData.tags;
  if (tags.length === 0) {
    document.getElementById(
      elBrainContentID + "-tags-content-active-tags-list"
    ).innerHTML = "";
    var emptyStateHTML = "";
    emptyStateHTML +=
      '<div class="flex flex-col items-center justify-center text-md font-semibold" style="align-self: center;width: 100%;height: 100%;">';
    emptyStateHTML += "<p style='margin-bottom: 0px;'>No tags yet 😔</p>";
    emptyStateHTML +=
      "<p class='font-normal text-gray-500'>Add tags from our suggestions</p>";
    emptyStateHTML += "</div>";
    document.getElementById(
      elBrainContentID + "-tags-content-active-tags-list"
    ).innerHTML = emptyStateHTML;
    return;
  }
  var tagsHTML = "";
  tags.forEach((tag, index) => {
    tagsHTML +=
      '<div class="flex flex-row items-center justify-center px-2 py-1 space-x-1 mr-1 mb-1 text-sm font-medium rounded-full" style="background-color: #E7E8FC; height:24px;">';
    tagsHTML += '<div class="flex-shrink-0"><img src="';
    tagsHTML += chrome.runtime.getURL("assets/images/tag.png");
    tagsHTML += '" width="16px" height="16px" /></div>';
    tagsHTML += "<div id='tag-item-" + index + "'>" + tag + "</div>";
    tagsHTML +=
      '<div class="flex-shrink-0 cursor-pointer remove-tag-item" id="tag-remove-item-id-' +
      index +
      '"><img idx="' +
      index +
      '" src="';
    tagsHTML += chrome.runtime.getURL("assets/images/tag-remove.png");
    tagsHTML += '" width="16px" height="16px" /></div>';
    tagsHTML += "</div>";
  });
  document.getElementById(
    elBrainContentID + "-tags-content-active-tags-list"
  ).innerHTML = tagsHTML;

  // remove tag item remove click listener
  if (document.getElementsByClassName("remove-tag-item").length > 0) {
    Array.from(document.getElementsByClassName("remove-tag-item")).forEach(
      (el) => {
        el.removeEventListener("click", removeTag, false);
      }
    );
  }

  // add tag item remove click listener
  if (document.getElementsByClassName("remove-tag-item").length > 0) {
    Array.from(document.getElementsByClassName("remove-tag-item")).forEach(
      (el) => {
        el.addEventListener("click", removeTag, false);
      }
    );
  }
};

const fillSuggestionsContent = () => {
  let tagsContentSuggestedEl = document.getElementById(
    elBrainContentID + "-tags-content-suggested"
  );
  if (!tagsContentSuggestedEl) {
    return;
  }

  const el = document.getElementById(elBrainContentID + "-tags-content-input");
  if (el.value.length > 0) {
    return;
  }

  tagsContentSuggestedEl.innerHTML = "";

  if (
    pageTagsSuggestions.length === 0 &&
    pageTagsRecommendations.length === 0
  ) {
    return;
  }

  var combined = [...pageTagsRecommendations];
  var i = 0;
  var k = 2;
  while (i < pageTagsSuggestions.length) {
    if (combined[k] !== undefined) {
      combined.splice(k, 0, pageTagsSuggestions[i]);
      k += 3;
    } else {
      combined.push(pageTagsSuggestions[i]);
    }
    i++;
  }

  Object.keys(combined).forEach((key, index) => {
    const item = combined[key];
    const tag = item.id;

    if (pageData.tags.indexOf(tag) === -1) {
      var bgColor =
        item.kind && item.kind === "recommended" ? "#6CF7D3" : "#82EBFC";
      var iconSrc =
        item.kind && item.kind === "recommended" ? "tag" : "tag-suggestion";

      if (item.local_type && item.local_type === "recommended") {
        bgColor = "#6CF7D3";
        iconSrc = "tag";
      }

      const el = document.createElement("div");
      el.className =
        "flex flex-row items-center justify-center px-2 py-1 space-x-1 mr-1 mb-1 text-sm font-medium rounded-full cursor-pointer tag-suggestion-item-" +
        index;
      el.style.backgroundColor = bgColor;
      el.style.height = "24px";
      el.innerHTML =
        '<div class="flex-shrink-0"><img src="' +
        chrome.runtime.getURL("assets/images/" + iconSrc + ".png") +
        '" width="16px" height="16px" /></div>';
      el.innerHTML += "<div>" + tag + "</div>";
      el.addEventListener("click", (e) => {
        addTag(tag);
      });
      document
        .getElementById(elBrainContentID + "-tags-content-suggested")
        .appendChild(el);
    }
  });
};

const fillAutoCompleteContent = (items) => {
  const el = document.getElementById(elBrainContentID + "-tags-content-input");
  if (el.value.length === 0) {
    return;
  }

  document.getElementById(
    elBrainContentID + "-tags-content-suggested"
  ).innerHTML = "";

  Object.keys(items).forEach((key, index) => {
    const item = items[key];
    const tag = item.id ? item.id : item;
    if (pageData.tags.indexOf(tag) === -1) {
      var bgColor =
        item.kind && item.kind === "recommended" ? "#6CF7D3" : "#82EBFC";
      var iconSrc =
        item.kind && item.kind === "recommended" ? "tag" : "tag-suggestion";

      const el = document.createElement("div");
      el.className =
        "flex flex-row items-center justify-center px-2 py-1 space-x-1 mr-1 mb-1 text-sm font-medium rounded-full cursor-pointer tag-suggestion-item-" +
        index;
      el.style.backgroundColor = bgColor;
      el.style.height = "24px";
      el.innerHTML =
        '<div class="flex-shrink-0"><img src="' +
        chrome.runtime.getURL("assets/images/" + iconSrc + ".png") +
        '" width="16px" height="16px" /></div>';
      el.innerHTML += "<div>" + tag + "</div>";
      el.addEventListener("click", (e) => {
        addTag(tag);
      });
      document
        .getElementById(elBrainContentID + "-tags-content-suggested")
        .appendChild(el);
    }
  });
};

// tab tags content --end

// tab notes content --start
const createNotesContent = () => {
  let tabContent = document.createElement("div");
  tabContent.id = elBrainContentID + "-notes-content";
  tabContent.style.position = "relative";
  tabContent.style.height = "100%";

  const favIcon = `
    <div>
      <img src="${pageData.favicon_url}" width="32" height="32" />
    </div>
  `;

  const title =
    pageData.title.length > 35
      ? pageData.title.substring(0, 35) + "..."
      : pageData.title;

  tabContent.innerHTML =
    `
      <div class="flex flex-col space-y-2 h-full">
        <div class="flex flex-row space-x-2">
      ` +
    favIcon +
    `
          <div class="font-semibold">` +
    title +
    `
          </div>
        </div>
        <div class="flex flex-grow fields">
          <textarea class="w-full h-full border border-gray-100 rounded-lg p-2 text-md" style="background: white;" id="` +
    elBrainContentID +
    `-notes-textarea"></textarea>
        </div>
        <div class="flex flex-row space-x-2 items-center">
          <a href="https://heybrain.ai/?filter=modified_urls" target="_blank">See all notes</a>
          <div class="flex-grow" id="` +
    elBrainContentID +
    `-notes-footer">
          </div>
            <div>
              <button class="px-6 py-2 text-white font-semibold rounded-full text-xs" style="background:#2B007B;" id="` +
    elBrainContentID +
    `-notes-save-button">
                SAVE
              </button>
            </div>
          </div>
        </div>
      </div>
  `;

  document.getElementById(elBrainContentID).innerHTML = "";
  document.getElementById(elBrainContentID).appendChild(tabContent);

  // save notes button click listener
  document
    .getElementById(elBrainContentID + "-notes-save-button")
    .addEventListener("click", saveNotes, false);

  // notes wysiwyg editor
  simpleEditor.init({
    selector: ".fields textarea",
    pastePlain: true,
  });

  if (pageData.notes_html) {
    document.querySelector(".text").innerHTML = pageData.notes_html;
  }
};

const saveNotes = () => {
  simpleEditor.save();
  let notes = document.querySelector(".text").innerText;
  let notes_html = document.querySelector(".text").innerHTML;

  if (
    document.getElementById(elBrainContentID + "-notes-save-button")
      .innerText === "SAVING"
  ) {
    return;
  }

  document.getElementById(elBrainContentID + "-notes-save-button").innerText =
    "SAVING";
  chrome.runtime.sendMessage(
    {
      action: "update-notes",
      data: {
        access_token: accessToken,
        id: pageData.id,
        notes: notes,
        notes_html: notes_html,
      },
    },
    (response) => {
      if (response) {
        pageData.notes = notes;
        pageData.notes_html = notes_html;
        document.getElementById(
          elBrainContentID + "-notes-save-button"
        ).innerText = "SAVE";
        document.getElementById(
          elBrainContentID + "-notes-footer"
        ).innerHTML = `<div class="text-xs text-green-600">Saved.</div>`;
        setTimeout(() => {
          document.getElementById(
            elBrainContentID + "-notes-footer"
          ).innerHTML = "";
        }, 2000);
      }
    }
  );
};
// tab notes content --end

// tab content related actions --end

// listeners --start
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "init") {
    chrome.storage.local.get(["access_token"], (data) => {
      if (data.access_token) {
        accessToken = data.access_token;
        init();
      }
    });
  } else if (request.action === "deinit") {
    if (document.getElementById("hey-brain-drawer") !== null) {
      document.body.removeChild(document.getElementById(elBrainDrawerID));
    }
    if (document.getElementById("hey-brain-root") !== null) {
      document.body.removeChild(document.getElementById(elBrainRootID));
    }
  }
});

if (document.readyState !== "complete") {
  window.addEventListener("load", afterWindowLoaded);
} else {
  afterWindowLoaded();
}

function afterWindowLoaded() {}

// listeners --end
