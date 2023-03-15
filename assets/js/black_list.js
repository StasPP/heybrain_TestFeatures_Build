let black_list = [];

/////////////////////// AUX functions  ----------------------------------------------------------------

function basicSearchUrl(myElement, myArray, checkSubPath) {    
    if (myArray === null || myArray === undefined || myArray.length === 0  || myElement === '') 
        return -2;   /// Error: Array is empty or undefined / page is empty  
    
    // Prepare for the search
    myElement = myElement[myElement.length-1] === '/' ? myElement : myElement + '/';

    for (let i = 0; i < myArray.length; i++) 
    {
        if (myArray[i] === myElement) {
            return i;  // found a strict coinsedence
        }
    }
    
    myElement = myElement.replace('http://', '').replace('https://', '').toLowerCase();
    for (let i = 0; i < myArray.length; i++) 
    {   
        let arrElement = myArray[i].replace('http://', '').replace('https://', '').toLowerCase();
        arrElement = arrElement[arrElement.length-1] === '/' ? arrElement : arrElement + '/';
        if (arrElement === myElement) return i;  // found a non-strict coinsedence

        if (checkSubPath) 
        if (myElement.length > arrElement.length) 
        if ( arrElement === myElement.slice(0, arrElement.length) ) return i; // found a domain match
    }

    return -1; // Element not in the array
}

function getDomainPart(url)
{
    let crop = -1;
    if (url.length > 2)
    {
        for (let i = 1; i < url.length-1; i++)
            if (url[i] == '/' && url[i+1] !=='/' && url[i-1] !== '/')
            {
                crop = i;
                break;
            }    
        if (crop > 0) return url.slice(0, crop);
    }
    return url;
}

// Test if is the page is contained in the Blacklist ------------------------------------------------------------------
let isInBlacklist = (page, doGetNumber, isDomain) =>  
{        
    if (black_list === undefined || black_list === null) black_list = [''];
    if (isDomain) page = getDomainPart(page);
    let idx = basicSearchUrl(page, black_list, !isDomain);
    return doGetNumber
            ? idx
            : idx > -1;
}

// Load from local storage. ToDo: Load from File, load from server ----------------------------------------------------
let getBlackList = () => 
{
    black_list = [];
    chrome.storage.local.get({heybrain_black_list:[]}, (result) => 
    {
        black_list = result.heybrain_black_list;
        console.log(result.heybrain_black_list);
        if (black_list === undefined || black_list === null) black_list = [];
    });
}

// The same but as a promise. ToDo: Load from File, load from server --------------------------------------------------
let refreshBlackList = () => 
{   return new Promise((resolve) => 
    {
        black_list = [];
        chrome.storage.local.get(["heybrain_black_list"]).then ( (result) => 
        {
            black_list = result.heybrain_black_list;
            if (black_list === undefined) black_list = [];
            console.log('Black list refreshed');
            resolve(true);
        });
    });
}

// Save to localStorage. ToDo: Save to File, Upload to server ---------------------------------------------------------
let saveBlackList = () => 
{
    if (black_list === undefined || black_list === null) black_list = [];
    chrome.storage.local.set({"heybrain_black_list": black_list});
}

function addPageToBlackList(page, allDomain)
{
    if (allDomain) page = getDomainPart(page);

    if (black_list === null || black_list === undefined || black_list.length === 0) 
        black_list = [];

    if (page != null && page != '' && !isInBlacklist(page))
    {
        page = page[page.length-1] === '/' ? page : page + '/';
        if (!black_list.includes(page))
        {
            black_list.push(page);
            saveBlackList();
            return true;
        }
    }    
    return false;
}

function deletePageFromBlackList(page, allDomain)
{
    if (allDomain) page = getDomainPart(page);
    page = page[page.length-1] === '/' ? page : page + '/';
    if (black_list === null || black_list === undefined || black_list.length === 0) 
        return false;
    
    let pos = isInBlacklist(page, true, false);
    console.log('deletePageFromBlackList:', pos)
    if (pos < 0) return false;

    black_list.splice(pos, 1);
    saveBlackList();
    
    return true;
}