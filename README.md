# Facebook Group Members Scraper

Script to scrape Facebook group members and export them into a CSV file. This Facebook Group members extractor works in the browser, without installing an extension or using a proxy. Just copy-paste the script into your Chrome console.

## How to run the Facebook Group Extractor script

 1. Go to a Facebook group page
 1. Open Chrome Developer Console
 1. Copy Paste the following code into the console. It will add a "Download 0 members" button
 1. Click on the "People" tab of the group page
 1. Scroll to load new members that will get caught by the script. The button counter increases with new members scraped.
 1. Once done, click on the "Download X members" button to download the generated CSV file

 Read our step-by-step [guide to extract Facebook group members and find their LinkedIn profile](https://www.datablist.com/how-to/scrape-facebook-group-members-linkedin)

> [dist/main.min.js](dist/main.min.js)

```javascript
function exportToCsv(e,t){for(var n="",i=0;i<t.length;i++)n+=function(e){for(var t="",n=0;n<e.length;n++){var i=null===e[n]||void 0===e[n]?"":e[n].toString(),i=(i=e[n]instanceof Date?e[n].toLocaleString():i).replace(/"/g,'""');0<n&&(t+=","),t+=i=0<=i.search(/("|,|\n)/g)?'"'+i+'"':i}return t+"\n"}(t[i]);var r=new Blob([n],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a");void 0!==o.download&&(r=URL.createObjectURL(r),o.setAttribute("href",r),o.setAttribute("download",e),document.body.appendChild(o),o.click(),document.body.removeChild(o))}function buildCTABtn(){const e=document.createElement("div");e.setAttribute("style",["position: fixed;","top: 0;","left: 0;","z-index: 10;","width: 100%;","height: 100%;","pointer-events: none;"].join(""));const t=document.createElement("div");t.setAttribute("style",["position: absolute;","bottom: 80px;","right: 130px;","color: white;","min-width: 150px;","background: blue;","border-radius: 8px","padding: 0px 12px;","cursor: pointer;","font-weight:600;","font-size:15px;","display: inline-flex;","pointer-events: auto;","height: 36px;","align-items: center;","justify-content: center;"].join(""));var n=document.createTextNode("Download ");const i=document.createElement("span");i.setAttribute("id","linkedin-scraper-number-tracker"),i.textContent="0";var r=document.createTextNode(" members");return t.appendChild(n),t.appendChild(i),t.appendChild(r),t.addEventListener("click",function(){var e=(new Date).toISOString();const n=[["Search Terms","LinkedInUrl","First Name","Last Name","Full Name","Title","Location","Is Premium","Summary"]];function i(e){return e||""}window.profiles_list.forEach((e,t)=>{e.linkedInProfileUrl&&e.searchTerms&&n.push([e.searchTerms,e.linkedInProfileUrl,i(e.firstName),i(e.lastName),i(e.fullName),i(e.title),i(e.location),e.isPremium?"True":"False",i(e.summary)])}),exportToCsv(`linkedInProfilesExport-${e}.csv`,n)}),e.appendChild(t),document.body.appendChild(e),e}function isProfile1(e){return"com.linkedin.voyager.dash.search.EntityResultViewModel"===e.$type&&!!e.navigationUrl&&-1!==e.navigationUrl.indexOf("linkedin.com/in/")}function isProfile2(e){return"com.linkedin.voyager.dash.identity.profile.Profile"===e.$type}function cleanLinkedInUrl(e){const t=new URL(e);return t.search="",t.hash="",t.toString()}function findProfileUsingFSDProfile(e){for(var[t,n]of window.profiles_list.entries())if(n.fsdProfile&&n.fsdProfile===e)return t;return null}function processResponse(e,u){let t;if(null!=e&&e.included){const n=(t=null==e?void 0:e.included).filter(e=>isProfile1(e)||isProfile2(e));if(0!==n.length){n.forEach(e=>{console.log(e);let t,n=!1;if(isProfile1(e))t=function(e){var t=null==e?void 0:e.navigationUrl;if(!t)return null;const n=null==e?void 0:e.entityUrn;let i;var r=n.match(/fsd_profile:(?<profile>(\w+))/);if(!(i=r&&r.groups&&r.groups.profile?r.groups.profile:i))return null;var r=null===(r=null==e?void 0:e.title)||void 0===r?void 0:r.text,o=null===(o=null==e?void 0:e.primarySubtitle)||void 0===o?void 0:o.text,l=null===(l=null==e?void 0:e.secondarySubtitle)||void 0===l?void 0:l.text,s=null===(s=null==e?void 0:e.summary)||void 0===s?void 0:s.text;let a=!1;null!=e&&e.badgeIcon&&(a=!0);const d={fsdProfile:i,linkedInProfileUrl:cleanLinkedInUrl(t),isPremium:a};return u&&(d.searchTerms=u),r&&(d.fullName=r),o&&(d.title=o),l&&(d.location=l),s&&(d.summary=s),d}(e),console.log(`Profile1 ${t.fullName} - ${t.firstName} - `+t.lastName);else{if(!isProfile2(e))throw new Error("Invalid profile");t=function(e){const t=null==e?void 0:e.entityUrn;let n;if(!t)return null;var i=t.match(/fsd_profile:(?<profile>(\w+))/);if(!(n=i&&i.groups&&i.groups.profile?i.groups.profile:n))return null;const r={fsdProfile:n};var i=null==e?void 0:e.publicIdentifier,o=null==e?void 0:e.firstName,l=null==e?void 0:e.lastName,e=null==e?void 0:e.headline;return i&&(r.linkedInProfileUrl="https://www.linkedin.com/in/"+i),o&&(r.firstName=o),l&&(r.lastName=l),e&&(r.title=e),u&&(r.searchTerms=u),r}(e),console.log(`Profile2 ${t.fullName} - ${t.firstName} - `+t.lastName),n=!0}t&&(console.log("fsdProfile: "+t.fsdProfile),(e=window.profiles_list.get(t.fsdProfile))?(console.log("Merge"),window.profiles_list.set(t.fsdProfile,{...e,...t})):n||window.profiles_list.set(t.fsdProfile,t))});const i=document.getElementById("linkedin-scraper-number-tracker");if(i){const r=new Map([...window.profiles_list].filter(([,e])=>!!e.linkedInProfileUrl&&!!e.searchTerms));i.textContent=r.size.toString()}}}}function parseResponse(e,t){var t=t.match(/\(keywords:(?<search_term>.+?)(?=,)/),n=t&&t.groups&&t.groups.search_term?decodeURIComponent(t.groups.search_term):null;let i=[];try{i.push(JSON.parse(e))}catch(e){console.error("Fail to parse API response",e)}for(let e=0;e<i.length;e++)processResponse(i[e],n)}function main(){buildCTABtn();const o=/start:(?<start>\d+)/gi,l=XMLHttpRequest.prototype.open,e=(XMLHttpRequest.prototype.open=function(){const e=arguments[1];if(-1!==e.indexOf("/voyager/api/graphql")&&-1!==e.indexOf("value:List(PEOPLE)")){const i=arguments,r=arguments[1];o.lastIndex=0;var t=o.exec(r);if(t){var n,t=null===(t=null==t?void 0:t.groups)||void 0===t?void 0:t.start;if(t)return n=parseInt(t)/10,i[1]=r.replace("start:"+t,"count:50,start:"+50*n),l.apply(this,i)}}return l.apply(this,arguments)},XMLHttpRequest.prototype.send);XMLHttpRequest.prototype.send=function(){this.addEventListener("readystatechange",function(){if(4===this.readyState){let e=this.responseURL.includes("/voyager/api/graphql");if(e=e&&-1!==this.responseURL.indexOf("value:List(ALL)")?!1:e){const t=new FileReader;t.onloadend=e=>{try{parseResponse(t.result,this.responseURL)}catch(e){console.error(e)}},t.readAsText(this.response)}}},!1),e.apply(this,arguments)}}window.profiles_list=window.profiles_list||new Map,main();```


## Exported Fields

- **Profile Id**: Unique facebook identifier. Multi-digit number.
- **Full Name**: First name and last name concatenated.
- **Profile Link**: Profile URI in the format https://www.facebook.com/{{username}}. When not available, default to https://www.facebook.com/profile.php?id={{profile_id}}
- **Bio**: Profile bio text.
- **Image Src**: Profile picture URI.
- **Group Id**: Facebook group identifier. Multi-digit number.
- **Group Joining Text**: Relative time since user joined the group. In the format: "Member since XX".
- **Profile Type**: Facebook profile type. "User" or "Page".


## Group Members Extractor tutorial with screenshots

**Open Chrome Developer Console**

To open the Chrome Developer console on Chrome, use the keyboard shortcut `Ctrl + Shift + I` (on Windows) or `Cmd + Option + I` (on Mac).

![Developer Tools](statics/open-developer-tools.png)





**Copy Paste the script**

Select the "Console" tab and copy-paste the script from above. Facebook shows a warning message in the "Console" asking not to  paste a script from a non-trustworthy source. It's true! And if you don't trust this script, stop here. [Read the source code](main.ts) to understand what this script does.

![Paste the script](statics/copy-paster-script.png)





**Click on the "People" tab and scroll to load new members**

In the Group Page, go to "People" and scroll to the bottom of the page. If the counter in the button text increases as your scroll, it's working!

![Scroll](statics/facebook-group-members-download.png)



**Export members in CSV format**

Once finished, or to perform "export checkpoints", click the button "Download X members". A Download window will prompt asking where to save your CSV file.

![Download CSV](statics/export-members-to-csv.png)





**Edit and view your CSV file**

[To load and view the CSV file](https://www.datablist.com/csv-editor), use [Datablist.com](https://www.datablist.com/) or any spreadsheet tools.


**Manage your Facebook leads and enrich them with LinkedIn Profile**

Use Facebook members profiles to build a leads database. Filter and segment leads to find the most relevant leads to contact. Then, enrich Facebook members with LinkedIn profile and email address.
Follow this step-by-step tutorial to [scrape Facebook members and find their LinkedIn profiles](https://www.datablist.com/how-to/scrape-facebook-group-members-linkedin)


## FAQ

- **How to remove the "Download" button?**
    - Just reload your Facebook page. Any javascript code added in Chrome Developer Console will be removed.
- **How many members can be extracted for one group?**
    - Facebook loads a maximum of 10k profiles in the "People" tab. We recommend extracting new members on a regular basis. And then, [consolidate all your Facebook profiles in a single list using Datablist.com](https://www.datablist.com/how-to/scrape-facebook-group-members-linkedin).
- **Can I extract members from different groups at one time?**
    - Yes. The exported CSV contains a "Group Id" attribute. Load members from one Facebook group, go to another group page (without reloading your page), load members, and click "Download". Members extracted from both groups will be in a single CSV file with different "Group Id" values.



## How to build it locally

```
yarn install
yarn build
```



The generated script is located in `dist/main.min.js`.
