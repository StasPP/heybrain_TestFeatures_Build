const baseURL = "https://api.nlpgraph.com/stage/api";

function loadUser() {
  chrome.storage.local.get(["user"], (data) => {
    if (data.user) {
      const user = JSON.parse(data.user);
      document.getElementById("user-username").innerHTML = user.username;
      document.getElementById("user-email").innerHTML = user.email;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const switchButton = document.querySelector('input[type="checkbox"]');
  checkSetting(); // required to check toggle's condition after refresh

  //TODO: Maybe a tiny loader, while fetching access_token?
  document.getElementById("sign-in").style.display = "none";
  document.getElementById("sign-up").style.display = "none";
  document.getElementById("signed-in").style.display = "none";
  document.getElementById("heybrain-settings").style.display = "none"; /// 2023-03-13 Added by Stanislav

  // Check if user is logged in
  chrome.storage.local.get(["access_token", "user"], (data) => {
    if (data.access_token) {
      document.getElementById("sign-in").style.display = "none";
      document.getElementById("sign-up").style.display = "none";
      document.getElementById("heybrain-settings").style.display = "none"; /// 2023-03-13 Added by Stanislav
      document.getElementById("signed-in").style.display = "flex";
      loadUser();
    } else {
      document.getElementById("sign-in").style.display = "flex";
      document.getElementById("signed-in").style.display = "none";
      document.getElementById("heybrain-settings").style.display = "none"; /// 2023-03-13 Added by Stanislav
    }
  });

  // Sign in, up & out actions.
  var signOut = document.getElementById("sign-out-button");
  signOut.addEventListener("click", function () {
    // localStorage.removeItem("access_token");
    // save access token to chrome storage
    chrome.storage.local.set({
      access_token: null,
      user: null,
    });
    document.getElementById("sign-in").style.display = "flex";
    document.getElementById("sign-up").style.display = "none";
    document.getElementById("signed-in").style.display = "none";

    //to turn off the app
    switchButton.checked = false; // NATALIA code:after sign out toggle is always off
    storeSetting(); // NATALIA code:after sign out toggle is always off
    checkSetting(); // NATALIA code:after sign out toggle is always off
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { message: "deinit" });
      });
    });
  });

  var showSignInButton = document.getElementById("show-sign-in-button");
  showSignInButton.addEventListener("click", function () {
    document.getElementById("sign-in").style.display = "flex";
    document.getElementById("sign-up").style.display = "none";
  });

  var showSignUpButton = document.getElementById("show-sign-up-button");
  showSignUpButton.addEventListener("click", function () {
    document.getElementById("sign-in").style.display = "none";
    document.getElementById("sign-up").style.display = "flex";
  });

  var signInButton = document.getElementById("sign-in-button"); // sign in button

  signInButton.addEventListener("click", function () {
    const signingInText = "SIGNING YOU IN...";
    let alertShown = false; // Initialize flag to track whether the alert has been shown

    if (signInButton.innerHTML == signingInText) {
      return;
    }
    var email = document.getElementById("sign-in-username");
    var password = document.getElementById("sign-in-password");

    email.disabled = true;
    password.disabled = true;
    signInButton.disabled = true;
    signInButton.innerHTML = signingInText;

    var emailValue = email.value;
    var passwordValue = password.value;
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "/auth/login", true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(
      JSON.stringify({
        username: emailValue,
        password: passwordValue,
      })
    );
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        if (req.status == 200) {
          const response = JSON.parse(req.responseText);
          chrome.storage.local.set({
            access_token: response.response.user.api_key,
            user: JSON.stringify(response.response.user),
          });
          // hide sign in form
          document.getElementById("sign-in").style.display = "none";
          // signed in form
          document.getElementById("signed-in").style.display = "flex";
          // load user
          loadUser();

          signInButton.innerHTML = "SIGN IN";
          email.disabled = false;
          password.disabled = false;
          signInButton.disabled = false;

          switchButton.checked = true; // NATALIA code:after sign toggle is always on
          storeSetting(); // NATALIA code:after sign toggle is always on
          checkSetting(); // NATALIA code:after sign toggle is always on
        } else if (!alertShown) {
          email.disabled = false;
          password.disabled = false;
          signInButton.disabled = false;
          signInButton.innerHTML = "SIGN IN";

          alert("Wrong username or password, please try again");
          alertShown = true; // Set the flag to indicate that the alert has been shown
        }
      }
    };

    //to turn on the app
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { message: "init" });
      });
    });

    // End of sign in, up & out actions.
  }); // End of sign in button event listener.

  var signUpButton = document.getElementById("sign-up-button");
  signUpButton.addEventListener("click", function () {
    const signingUpText = "SIGNING YOU UP...";
    if (signUpButton.innerHTML == signingUpText) {
      return;
    }

    var username = document.getElementById("sign-up-username");
    var email = document.getElementById("sign-up-email");
    var password = document.getElementById("sign-up-password");
    var passwordConfirm = document.getElementById("sign-up-confirm-password");

    if (username.value == "") {
      alert("Username is required.");
      return;
    }

    if (email.value == "") {
      alert("Email is required.");
      return;
    }
    // Define the regular expression to match the email
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    // Check if the email meets the regular expression
    if (!emailRegex.test(email.value)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.value == "") {
      alert("Password is required.");
      return;
    }

    // Define the regular expression to match the password
    const regex =
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    // Check if the password meets the regular expression
    if (!regex.test(password.value)) {
      alert(
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number or special character."
      );
      return;
    }

    if (password.value !== passwordConfirm.value) {
      alert("Passwords do not match.");
      return;
    }

    username.disabled = true;
    email.disabled = true;
    password.disabled = true;
    passwordConfirm.disabled = true;
    signUpButton.disabled = true;
    signUpButton.innerHTML = signingUpText;

    var usernameValue = username.value;
    var emailValue = email.value;
    var passwordValue = password.value;
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "/auth/register", true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(
      JSON.stringify({
        username: usernameValue,
        email: emailValue,
        password: passwordValue,
        firstname: "",
        lastname: "",
      })
    );
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        const response = JSON.parse(req.responseText);
        if (
          response.code === 200 &&
          response.data &&
          response.data.accessToken.length > 0 &&
          response.data.user &&
          response.data.user.api_key
        ) {
          chrome.storage.local.set({
            access_token: response.data.user.api_key,
            user: JSON.stringify(response.data.user),
          });
          // hide sign in form
          document.getElementById("sign-up").style.display = "none";
          // signed in form
          document.getElementById("signed-in").style.display = "flex";
          // load user
          loadUser();
        } else {
          username.disabled = false;
          email.disabled = false;
          password.disabled = false;
          passwordConfirm.disabled = false;
          signUpButton.disabled = false;
          signUpButton.innerHTML = "SIGN UP";
          alert(response.response);
        }
      } else {
        username.disabled = false;
        email.disabled = false;
        password.disabled = false;
        passwordConfirm.disabled = false;
        signUpButton.disabled = false;
        signUpButton.innerHTML = "SIGN UP";
      }
    };
  }); // End of sign up button event listener.

  var syncHistoryButton = document.getElementById("sync-history-button");

  syncHistoryButton.addEventListener("click", function () {
    console.log("clicked on sync");
    const nonSyncText = "SYNC HISTORY";
    const syncText = "SYNCING...";
    if (syncHistoryButton.innerHTML == syncText) {
      return;
    }
    chrome.storage.local.get(["access_token", "user"], (data) => {
      console.log("before sync hestory");
      syncHistoryButton.innerHTML = syncText;
      syncHistoryButton.disabled = true;
      chrome.runtime.sendMessage(
        {
          action: "sync-history",
          data: data,
        },
        (response) => {
          console.log(response);
          syncHistoryButton.innerHTML = nonSyncText;
          alert(
            "This could take up to a few hours but this shouldn’t stop you from start using Brain!"
          );
        }
      );
    });
  }); // End of sync-history button event listener.

  switchButton.addEventListener("click", function () {
    storeSetting();
    checkSetting();
  }); // End of switchButton event listener.

  function storeSetting() {
    const isEnabled = switchButton.checked; //true or false
    const setting = { enabled: isEnabled };
    chrome.storage.local.set(setting);
  }

  function checkSetting() {
    chrome.storage.local.get(["enabled"]).then((result) => {
      const isEnabled = result.enabled;
      switchButton.checked = isEnabled;
    });
  }

  /// 2023-03-13 Added by Stanislav: BEGIN ----------------------------------------------------------------

  let addpage_button = document.getElementById("addpage-button");
  let adddom_button  = document.getElementById("adddom-button");
  let delpage_button = document.getElementById("delpage-button");
  let deldom_button  = document.getElementById("deldom-button");
  let delpage_label  = document.getElementById("page-is-blocked");
  let deldom_label  = document.getElementById("domain-is-blocked");
  let kaputt_label  = document.getElementById("wrong-page");

  let current_number;

  function applyBlackListButtons(status) {
    console.log('BlackList status code: '+status)
    switch (status) {
      case -1: addpage_button.style.display = "none";
              delpage_button.style.display = "none";
              adddom_button.style.display = "none";
              deldom_button.style.display = "none"; 
              deldom_label.style.display = "none"; 
              delpage_label.style.display = "none"; 
              kaputt_label.style.display = "display"; 
              break;
      case 1: addpage_button.style.display = "none";
              delpage_button.style.display = "display";
              adddom_button.style.display = "none";
              deldom_button.style.display = "none"; 
              delpage_label.style.display = "display"; 
              deldom_label.style.display = "none"; 
              kaputt_label.style.display = "none";
              break;
      case 2: addpage_button.style.display = "none";
              delpage_button.style.display = "none";
              adddom_button.style.display = "none";
              deldom_button.style.display = "display";
              delpage_label.style.display = "none"; 
              deldom_label.style.display = "display"; 
              kaputt_label.style.display = "none";
              break;
      case 0:
              addpage_button.style.display = "display";
              delpage_button.style.display = "none";
              adddom_button.style.display = "display";
              deldom_button.style.display = "none";
              deldom_label.style.display = "none"; 
              delpage_label.style.display = "none"; 
              kaputt_label.style.display = "none";
              break;
      default: addpage_button.style.display = "display";
              delpage_button.style.display = "none";
              adddom_button.style.display = "display";
              deldom_button.style.display = "none";
              deldom_label.style.display = "none"; 
              delpage_label.style.display = "none"; 
              kaputt_label.style.display = "none";
    }
  }

  function checkBlackList() {
    console.log('--- DOING INIT OF BLACKLIST MENU ------');
    chrome.storage.local.get(['heybrain_current_url']).then( (obj) => 
    { 
      let my_url = obj.heybrain_current_url;
      if (my_url === undefined || my_url === '') 
      {
        applyBlackListButtons(-1); 
        return 0;
      }

      let checkIsInBlacklist = new Promise((resolve)  => 
      {
        chrome.runtime.sendMessage(
          {action: "getBlackList", key: my_url}, 
            (response) => {
              console.log('Page message recieved: '+ response.data);
              resolve(response.data) 
            });
      });
      
      let checkDomIsInBlacklist =  new Promise((resolve)  => 
      {
        chrome.runtime.sendMessage(
            {action: "getBlackListDom", key: my_url}, 
              (response) => {
                console.log('Dom message recieved: '+ response.data);
                resolve(response.data) 
              });
      });

      checkIsInBlacklist.then((inBlackListResponse) => 
      {
        let isURLinBL = inBlackListResponse[0];
        checkDomIsInBlacklist.then((DomInBlackListResponse) => 
        {
          let isDomInBL = DomInBlackListResponse[0];

          let black_list_state = isDomInBL > -1
                            ?  2  // Domain is not in the blacklist
                            : isURLinBL > -1
                              ? 1  // Page is in the blacklist
                              : 0; // Nothing is in the blacklist
          applyBlackListButtons(black_list_state); 

        });  
      });   
  
    }); // getting end
    console.log('--- INIT OF BLACKLIST MENU IS DONE ------');
  }

  var GoSettingsButton = document.getElementById("heybrain-settings-button");
  
  GoSettingsButton.addEventListener("click", function () {
    console.log("---- OPENING SETTINGS ----");
    document.getElementById("sign-in").style.display = "none";
    document.getElementById("sign-up").style.display = "none";
    document.getElementById("signed-in").style.display = "none";
    document.getElementById("heybrain-settings").style.display = "flex";
    checkBlackList();
    console.log("---- OPENING SETTINGS IS DONE----");
  });

  addpage_button.addEventListener("click", function () 
  {
    chrome.storage.local.get(['heybrain_current_url']).then( (obj) => 
    { 
      let url = obj.heybrain_current_url;
      if (url !== null || url !== undefined || url !== '') 
      {
        console.log('!!!!!addPageToBlackList');
        chrome.runtime.sendMessage(
          {action: "addPageToBlackList", key: url}, 
            (response) => 
            {
              console.log('Adding message recieved: '+ response.data);
              checkBlackList();
            });  
      }
    });
  });

  adddom_button.addEventListener("click", function () {
    chrome.storage.local.get(['heybrain_current_url']).then( (obj) => 
    { 
      console.log('!!!!!addDomainToBlackList');
      let url = obj.heybrain_current_url;
      if (url !== null || url !== undefined || url !== '') 
      {
        chrome.runtime.sendMessage(
          {action: "addDomainToBlackList", key: url}, 
            (response) => 
            {
              console.log('Dom message recieved: '+ response.data);
              checkBlackList();
            });  
      }
    });
  }); 

  delpage_button.addEventListener("click", function () 
  {
    console.log('!!!!!deletePageFromBlackList');
    chrome.storage.local.get(['heybrain_current_url']).then( (obj) => 
    { 
      let url = obj.heybrain_current_url;
      console.log('!!!!!deletePageFromBlackList');
      if (url !== null || url !== undefined || url !== '') 
      {
        chrome.runtime.sendMessage(
          {action: "delPageFromBlackList", key: url}, 
            (response) => 
            {
              console.log('Adding message recieved: '+ response.data);
              checkBlackList();
            });  
      }
    });
  });

  deldom_button.addEventListener("click", function () {
    chrome.storage.local.get(['heybrain_current_url']).then( (obj) => 
    { 
      let url = obj.heybrain_current_url;
      console.log('!!!!!deletePageFromBlackList');
      if (url !== null || url !== undefined || url !== '') 
      {
        chrome.runtime.sendMessage(
          {action: "delDomainFromBlackList", key: url}, 
            (response) => 
            {
              console.log('Dom message recieved: '+ response.data);
              checkBlackList();
            });  
      }
    });
  }); 
  /// 2023-03-13 Added byStanislav: END ----------------------------------------------------------------
}); // End of DOMContentLoaded event listener.
