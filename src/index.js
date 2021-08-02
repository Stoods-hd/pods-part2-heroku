import {
    createSolidDataset,
    createThing,
    setThing,
    addUrl,
    addStringNoLocale,
    saveSolidDatasetAt,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    FetchError
 } from "@inrupt/solid-client";
 
import {
   login,
   handleIncomingRedirect,
   getDefaultSession,
   fetch
} from "@inrupt/solid-client-authn-browser";
 
import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

const buttonLogin = document.querySelector("#btnLogin");
const buttonCreate = document.querySelector("#btnCreate");
buttonCreate.disabled=true;
const labelCreateStatus = document.querySelector("#labelCreateStatus");

// 1a. Start Login Process. Call login() function.
function loginToInruptDotCom() {

  return login({
    oidcIssuer: "https://broker.pod.inrupt.com",
    redirectUrl: window.location.href + "?podusername=" + document.getElementById("PodUserName").value,
    clientName: "Getting started app"
  });
 
 }
 
 function loginToInruptDotNet() {
 
   return login({
     oidcIssuer: "https://inrupt.net",
     redirectUrl: window.location.href + "?podusername=" + document.getElementById("PodUserName").value,
     clientName: "Getting started app"
   });
 }
  
  // 1b. Login Redirect. Call handleIncomingRedirect() function.
  // When redirected after login, finish the process by retrieving session information.
  async function handleRedirectAfterLogin() {
  
      await handleIncomingRedirect();
      const session = getDefaultSession();
      if (session.info.isLoggedIn) {
        // Update the page with the status.
        document.getElementById("labelStatus").textContent = "Your session is logged in.";
        document.getElementById("labelStatus").setAttribute("role", "alert");

        // Get detail from URL
        var queryString = window.location.search;
        var urlParams = new URLSearchParams(queryString);
        var podusername = urlParams.get('podusername')
        document.getElementById("PodUserName").value = podusername

        // Set the Pod URL
        if (session.info.webId.includes("inrupt.com")) {
          document.getElementById("PodURL").value = "https://pod.inrupt.com/" + podusername + "/testdata/myReadingList";
        }
        else {
          document.getElementById("PodURL").value = "https://" + podusername  + ".inrupt.net/testdata/myReadingList";
        }

        // Enable Create button
        buttonCreate.disabled=false;
      }
  }
  
  // The example has the login redirect back to the index.html.
  // This calls the function to process login information.
  // If the function is called when not part of the login redirect, the function is a no-op.

  handleRedirectAfterLogin();
    

  async function createList() {
    labelCreateStatus.textContent = "";
    const podUrl = document.getElementById("PodURL").value;
    
    // For simplicity and brevity, this tutorial hardcodes the SolidDataset URL.
    // In practice, you should add a link to this resource in your profile that applications can follow.
    const readingListUrl = `${podUrl}`;
   
    let titles = document.getElementById("titles").value.split("\n");
    
    // Create a new SolidDataset - get it first (i.e., the reading list)
    var myReadingList;

    try {
      myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
    } catch (error) {
      if (error instanceof FetchError) {
          if (error.statusCode === 404) {
            myReadingList = createSolidDataset();
          }
          else {
              console.error(error.message);
          }
      } else {
          console.error(error.message);
      }
    }

    // Add titles to the Dataset
    for (let i = 0; i < titles.length; i++) {
      let title = createThing({name: "title" + i});
      title = addUrl(title, RDF.type, AS.Article);
      title = addStringNoLocale(title, SCHEMA_INRUPT.name, titles[i]);
      myReadingList = setThing(myReadingList, title);
    }
  
    try {
       
      // Save the SolidDataset 
      let savedReadingList = await saveSolidDatasetAt(
        readingListUrl,
        myReadingList,
        { fetch: fetch }
      );
  
      labelCreateStatus.textContent = "Saved";
      // Disable Create button
      // buttonCreate.disabled=true;
  
      // Refetch the Reading List
      savedReadingList = await getSolidDataset(
        readingListUrl,
        { fetch: fetch }
      );
  
      let items = getThingAll(savedReadingList);
  
      let listcontent="";
      for (let i = 0; i < items.length; i++) {
        let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
        if (item != null) {
            listcontent += item + "\n";
        }
      }
  
      document.getElementById("savedtitles").value = listcontent;
  
    } catch (error) {
      console.log(error);
      labelCreateStatus.textContent = "Error" + error;
      labelCreateStatus.setAttribute("role", "alert");
    }
   
  }

  // 3. Read the Reading List
  async function readList() {
    const podUrl = document.getElementById("PodURLRead").value;
    
    // For simplicity and brevity, this tutorial hardcodes the SolidDataset URL.
    // In practice, you should add a link to this resource in your profile that applications can follow.
    const readingListUrl = `${podUrl}`;
   
    // Create a new SolidDataset - get it first (i.e., the reading list)
    var podReadingList;

    try {
       podReadingList = await getSolidDataset(
        readingListUrl,
        { fetch: fetch }
      );

      let items = getThingAll(podReadingList);
  
      let listcontent="";
      for (let i = 0; i < items.length; i++) {
        let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
        if (item != null) {
            listcontent += item + "\n";
        }
      }
  
      document.getElementById("DataOutputResponse").value = listcontent;
  
    } catch (error) {
      if (error instanceof FetchError) {
          if (error.statusCode === 401) {
            console.error(error.message);
            window.alert("You are not authorised to access this data");
          }
          else if (error.statusCode === 404) {
            console.error(error.message);
            window.alert("Data does not exist");
          }
          else {
            console.error(error.message);
          }
      }
    }
   
  }

  btnLoginDotNet.onclick = function() {
    loginToInruptDotNet();
  };
   
  btnLoginDotCom.onclick = function() {
     loginToInruptDotCom();
  };
   
  
  buttonCreate.onclick = function() {  
    createList();
  };

    
  btnRead.onclick = function() {  
    readList();
  };
  