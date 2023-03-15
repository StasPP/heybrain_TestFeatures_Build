try {importScripts("assets/js/black_list.js")} catch (e) {console.log(e);} // 2023-03-12 #1 added by Stanislav

const baseURL = "https://api.nlpgraph.com/stage/api";
var autoCompleteControllers = [];
let enabled; // shows if app's toggle is switched on or off: true or false
let current_page = {url: '', id: ''};
checkEnable();
getBlackList(); // 2023-03-12 #10 added by Stanislav

function checkEnable() {
  chrome.storage.local.get(["enabled"], (result) => {
    enabled = result.enabled;
  });
}

// 2023-03-12 #6 added by Stanislav: BEGIN  ------------------------
let startOrStop = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) 
  {
    let url = current_page.url;
    let id = current_page.id;
    console.log(current_page);
    chrome.storage.local.get(["enabled"]).then((result) => 
    {
      refreshBlackList().then(() => {
       
        let blackListIdx = isInBlacklist(url, true, false)
        console.log('--- INTING START OR STOP ---');
        let needToInit = result.enabled
                        && blackListIdx < 0;  /// ToDo: add the condition for Snoose

        chrome.tabs.sendMessage(tabs[0].id, {
          action:
            needToInit
              ? "init"
              : "deinit",
        });

        console.log('--- INTING START OR STOP DONE ---'); 

      }); // refreshBlacklist end

    });
    
  })
}
// 2023-03-12 #6 added by Stanislav: END  ------------------------

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  updateCurrentUrl();  // 2023-03-12 #2 added by Stanislav
  checkEnable();
  if (enabled && changeInfo.status === "complete" && tab.active) {
    startOrStop();  // 2023-03-13 #7 changed by Stanislav
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes?.enabled) {
    chrome.storage.local.get(["enabled"]).then((result) => {
      startOrStop(); // 2023-03-13 #8 changed by Stanislav
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateCurrentUrl();  // 2023-03-12 #3 added by Stanislav
  chrome.storage.local.get(["enabled"]).then((result) => {
    startOrStop(); // 2023-03-13 #9 changed by Stanislav
  });
});

// 2023-03-12 #4 added by Stanislav: BEGIN  ------------------------
function updateCurrentUrl()   // Save the current url to local storage for sharing it between modules
{
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs =>   
  {
      if (tabs[0].url != '' && tabs[0].url !== undefined && tabs[0].url !== null) 
      {
        chrome.storage.local.set({'heybrain_current_url': tabs[0].url})
        current_page.url = tabs[0].url;
        current_page.id = tabs[0].id;
      }
      else
        chrome.storage.local.set({'heybrain_current_url': ''})
  } );
  getBlackList;
}
// 2023-03-12 #4 added by Stanislav: END  --------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // 2023-03-12 #5 added by Stanislav: BEGIN  ------------------------  
  if (request.action === "getBlackList")   // Getting the response for the content (is the URL in the black list)
  
  {   
    let resp_data = isInBlacklist(request.key, true, false);
    console.log('Sending the BlackList response for Page: '+ resp_data);
    sendResponse({data:  [resp_data] });   
  }
  // 2023-03-12 #5 added by Stanislav: END  --------------------------
  
  // 2023-03-14 #11 added by Stanislav: BEGIN  ------------------------  
  if (request.action === "getBlackListDom")   // Getting the response for the content (is the DOM URL in the black list)
    {
      let resp_data = isInBlacklist(request.key, true, true);
      console.log('Sending the BlackList response for Domain: '+ resp_data);
      sendResponse({data:  [resp_data] });
    }
  // 2023-03-14 #11 added by Stanislav: END  --------------------------
 
  // 2023-03-15 #12 added by Stanislav: BEGIN  ------------------------  
  if (request.action === "addPageToBlackList")
    {
        let resp_data = addPageToBlackList(request.key, false);
        sendResponse({data:  [resp_data] });
    }
  
  if (request.action === "addDomainToBlackList")
    {
      let resp_data = addPageToBlackList(request.key, true);
      sendResponse({data:  [resp_data] });
    }

  if (request.action === "delPageFromBlackList")
    {
        let resp_data = deletePageFromBlackList(request.key, false);
        sendResponse({data:  [resp_data] });
    }
  
  if (request.action === "delDomainFromBlackList")
    {
      let resp_data = deletePageFromBlackList(request.key, true);
      sendResponse({data:  [resp_data] });
    }

  // 2023-03-15 #12 added by Stanislav: END -------------------------- 

  if (request.action === "get-url-data") {
    fetch(baseURL + "/brain/get_url_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
      body: JSON.stringify({
        url: sender.url,
        title: sender.tab.title,
        domain: request.data.domain,
        description: request.data.page_description,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!"favicon" in (data.response || {})) {
          data.response.favicon = sender.tab.favIconUrl;
        }
        sendResponse(data.response);
      });
    return true;
  } else if (request.action === "get-smartpast") {
    const url = new URL(baseURL + "/brain/embeddings/related");

    url.search = new URLSearchParams({
      id: request.data.id,
      text: request.data.text,
      is_new: request.data.is_new ? 1 : 0,
      limit: request.data.limit || 10,
    });

    fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!"favicon" in (data.response || {})) {
          data.response.favicon = sender.tab.favIconUrl;
        }

        sendResponse(data.response);
      });
    return true;
  } else if (request.action === "update-notes") {
    var id = request.data.id;
    var notes = request.data.notes;
    var notes_html = request.data.notes_html;

    fetch(baseURL + "/brain/update_url_document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
      body: JSON.stringify({
        id: id,
        notes: notes,
        notes_html: notes_html,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data.response);
      });
    return true;
  } else if (request.action === "save-screenshot") {
    var id = request.data.id;
    const getScreenshot = new Promise((res, rej) => {
      chrome.tabs.captureVisibleTab(
        sender.tab.windowId,
        {},
        function (dataUrl) {
          res(dataUrl);
        }
      );
    });
    getScreenshot.then((data) => {
      fetch(baseURL + "/brain/update_url_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: request.data.access_token,
        },
        body: JSON.stringify({
          id: id,
          screenshot: data,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          sendResponse(data.response);
        });
    });
    return true;
  } else if (request.action === "add-tags") {
    var id = request.data.id;
    var tags = request.data.tags;

    fetch(baseURL + "/document/add_tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
      body: JSON.stringify({
        id: id,
        tags: tags,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data.response);
      });
    return true;
  } else if (request.action === "remove-tags") {
    var id = request.data.id;
    var tags = request.data.tags;

    fetch(baseURL + "/document/remove_tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
      body: JSON.stringify({
        id: id,
        tags: tags,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data.response);
      });
    return true;
  } else if (request.action === "suggested-tags") {
    fetch(baseURL + "/tag/suggested?id=" + request.data.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        api_key: request.data.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data);
      });
    return true;
  } else if (request.action === "recommended-tags") {
    fetch(
      baseURL +
        "/tag/recommended?doc_id=" +
        request.data.id +
        "&type=keyword&limit=10",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          api_key: request.data.access_token,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data);
      });
    return true;
  } else if (request.action === "autocomplete-tags") {
    if (autoCompleteControllers.length > 0) {
      autoCompleteControllers.forEach((controller) => {
        controller.abort();
      });
      autoCompleteControllers = [];
    }

    var autoCompleteController = new AbortController();
    autoCompleteControllers.push(autoCompleteController);
    fetch(
      baseURL +
        "/tag/search/autocomplete?q=" +
        request.data.query +
        "&limit=10",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          api_key: request.data.access_token,
        },
        signal: autoCompleteController.signal,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data);
        isLoadingAutocomplete = false;
      });
    return true;
  } else if (request.action === "sync-history") {
    getHistory().then((history) => {
      // response is an array of history items
      // make them a csv
      // get headers
      const headers = Object.keys(history[0]);

      const csv = history
        .map((item) => {
          const names = Object.keys(item);

          return names
            .map((name) => {
              return `"${item[name]}"`;
            })
            .join(",");
        })
        .join("\n");

      const csvWithHeaders = [headers.join(","), csv].join("\n");

      // save csv to file
      const blob = new Blob([csvWithHeaders], { type: "text/csv" });
      //const url = URL.createObjectURL(blob);

      fetch(baseURL + "/tools/browser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          api_key: request.data.access_token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          uploadFile(blob, data.response).then((result) => {
            sendResponse(result);
          });
        });
      // somehow get the url for put to s3
      // ...

      // upload to s3
      // ...

      // enjoy the party

      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "history.csv";
      // a.click();
      // URL.revokeObjectURL(url);
    });

    return true;
  } else {
    sendResponse({});
  }
});

// get all chrome history
const getHistory = () => {
  return new Promise((resolve, reject) => {
    chrome.history.search(
      {
        text: "",
        startTime: 0,
        endTime: Date.now(),
        maxResults: 100000,
      },
      (historyItems) => {
        resolve(historyItems);
      }
    );
  });
};

async function uploadFile(file, presignedPost) {
  const formData = new FormData();
  //formData.append("Content-Type", file.type);
  Object.entries(presignedPost.fields).forEach(([key, value]) => {
    if (key == "key") {
      value = value.replace("${filename}", "history.csv");
    }
    formData.append(key, value);
  });
  formData.append("file", file);

  const res = await fetch(presignedPost.url, {
    method: "POST",
    body: formData,
  });

  const location = res.headers.get("Location"); // get the final url of our uploaded file
  return decodeURIComponent(location);
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    // 2023-03-12 #7 changed by Stanislav
    if (key === "access_token" || key === 'heybrain_black_list') {
      // changes[key].newValue && changes[key].newValue.length > 0
      startOrStop();
    }
  }

});
