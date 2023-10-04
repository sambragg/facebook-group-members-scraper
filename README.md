# Facebook Group Members Scraper

Script to scrape Facebook group members and export them into a CSV file. This Facebook Group members extractor works in the browser, without installing an extension or using a proxy. Just copy-paste the script into your Chrome console.

## How to run the Facebook Group Extractor script

 1. Go to a Facebook group page
 1. Open Chrome Developer Console
 1. Copy Paste the following code into the console. It will add a "Download members" button
 1. Click on the "Members" tab of the group page
 1. Scroll to load new members that will get caught by the script. The button counter increases with new members scraped.
 1. Once done, click on the "Download X members" button to download the generated CSV file

 Read our step-by-step [guide to extract Facebook group members and find their LinkedIn profile](https://www.datablist.com/how-to/scrape-facebook-group-members-linkedin)

> [dist/main.min.js](dist/main.min.js)

```javascript
var groupId,groupName,groupUrl;function exportToCsv(e,t){for(var o="",r=0;r<t.length;r++)o+=function(e){for(var t="",o=0;o<e.length;o++){var r=null===e[o]||void 0===e[o]?"":e[o].toString(),r=(r=e[o]instanceof Date?e[o].toLocaleString():r).replace(/"/g,'""');0<o&&(t+=","),t+=r=0<=r.search(/("|,|\n)/g)?'"'+r+'"':r}return t+"\n"}(t[r]);var n=new Blob([o],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a");void 0!==i.download&&(n=URL.createObjectURL(n),i.setAttribute("href",n),i.setAttribute("download",e),document.body.appendChild(i),i.click(),document.body.removeChild(i))}function buildCTABtn(){var e=document.createElement("div"),t=(e.setAttribute("style",["position: fixed;","top: 0;","left: 0;","z-index: 10;","width: 100%;","height: 100%;","pointer-events: none;"].join("")),document.createElement("div")),o=(t.setAttribute("style",["position: absolute;","bottom: 30px;","right: 130px;","color: white;","min-width: 150px;","background: var(--primary-button-background);","border-radius: var(--button-corner-radius);","padding: 0px 12px;","cursor: pointer;","font-weight:600;","font-size:15px;","display: inline-flex;","pointer-events: auto;","height: 36px;","align-items: center;","justify-content: center;"].join("")),document.createTextNode("Download ")),r=document.createElement("span"),n=(r.setAttribute("id","fb-group-scraper-number-tracker"),r.textContent="0",document.createTextNode(" members"));return t.appendChild(o),t.appendChild(r),t.appendChild(n),t.addEventListener("click",function(){var e=(new Date).toISOString().replace(" ","-");window.members_list.forEach(function(e,t){0<t&&(e[4]=groupName,e[5]=groupUrl,e[6]=groupId)}),exportToCsv("".concat(e," ").concat(groupName," (").concat(groupId,").csv"),window.members_list)}),e.appendChild(t),document.body.appendChild(e),e}function processResponse(e){var t,o;if(null!==(t=null==e?void 0:e.data)&&void 0!==t&&t.group)r=e.data.group;else if("Group"===(null===(t=null===(t=null==e?void 0:e.data)||void 0===t?void 0:t.node)||void 0===t?void 0:t.__typename))r=e.data.node;else{if(null==e||!e.payload)return;groupName=e.payload.payload.result.exports.meta.title,groupId=e.payload.payload.result.exports.rootView.props.groupID,groupUrl="https://www.facebook.com/groups/".concat(groupId)}if(null!==(t=null==r?void 0:r.new_members)&&void 0!==t&&t.edges)o=r.new_members.edges;else if(null!==(e=null==r?void 0:r.new_forum_members)&&void 0!==e&&e.edges)o=r.new_forum_members.edges;else{if(null===(t=null==r?void 0:r.search_results)||void 0===t||!t.edges)return;o=r.search_results.edges}var e=o.map(function(e){var e=e.node,t=e.id,o=e.name,r=e.bio_text,n=e.url;e.__isProfile;return[t,o,n,(null==r?void 0:r.text)||"","groupName","groupUrl","groupId"]}),r=((t=window.members_list).push.apply(t,e),document.getElementById("fb-group-scraper-number-tracker"));r&&(r.textContent=window.members_list.length.toString())}function parseResponse(e){var o=[];e=e.replace("for (;;);","");try{o.push(JSON.parse(e))}catch(t){var r=e.split("\n");if(r.length<=1)return void console.error("Fail to parse API response",t);for(var n=0;n<r.length;n++){var i=r[n];try{o.push(JSON.parse(i))}catch(e){console.error("Fail to parse API response",t)}}}for(var t=0;t<o.length;t++)processResponse(o[t])}function main(){function e(e){var t=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){this.addEventListener("readystatechange",function(){this.responseURL.includes(e)&&4===this.readyState&&parseResponse(this.responseText)},!1),t.apply(this,arguments)}}e("ajax/navigation/"),e("/api/graphql/"),buildCTABtn()}window.members_list=window.members_list||[["Profile ID","Full Name","Profile URL","Bio","Group Name","Group URL","Group ID"]],main();```


## Exported Fields

- **Profile Id**: Unique facebook identifier. Multi-digit number.
- **Full Name**: First name and last name concatenated.
- **Profile Link**: Profile URL in the format https://www.facebook.com/{{username}}. When not available, default to https://www.facebook.com/profile.php?id={{profile_id}}
- **Bio**: Profile bio text.
- **Group Name**: Name of the group.
- **Group URL**: The group's URL
- **Group ID**: Facebook group identifier. Multi-digit number.


## Group Members Extractor tutorial with screenshots

Navigate to the group's main page (as of writing, labelled 'Discussion').

**Open Chrome Developer Console**

To open the Chrome/Firefox Developer console on Chrome, use the keyboard shortcut `Ctrl + Shift + I` (on Windows) or `Cmd + Option + I` (on Mac).

![Developer Tools](statics/open-developer-tools.png)





**Copy Paste the script**

Select the "Console" tab and copy-paste the script from above. Facebook shows a warning message in the "Console" asking not to  paste a script from a non-trustworthy source. It's true! And if you don't trust this script, stop here. [Read the source code](main.ts) to understand what this script does.

![Paste the script](statics/copy-paster-script.png)





**Click on the "Members" tab and scroll to load new members**

In the Group Page, go to "Members" and scroll to the bottom of the page. If the counter in the button text increases as your scroll, it's working!

![Scroll](statics/facebook-group-members-download.png)



**Export members in CSV format**

Once finished, or to perform "export checkpoints", click the button "Download X members". A Download window will prompt asking where to save your CSV file.

![Download CSV](statics/export-members-to-csv.png)





**Edit and view your CSV file**

[To load and view the CSV file](https://www.datablist.com/csv-editor), use [Datablist.com](https://www.datablist.com/) or any spreadsheet tool.


**Manage your Facebook leads and enrich them with LinkedIn Profile**

Use Facebook members profiles to build a leads database. Filter and segment leads to find the most relevant leads to contact. Then, enrich Facebook members with LinkedIn profile and email address.
Follow this step-by-step tutorial to [scrape Facebook members and find their LinkedIn profiles](https://www.datablist.com/how-to/scrape-facebook-group-members-linkedin)


## FAQ

- **How to disable the script and remove the "Download" button?**
    - Just reload your Facebook page and any javascript code added in Chrome Developer Console will be removed.
- **How many members can be extracted for one group?**
    - Facebook loads a maximum of 10k profiles in the "Members" tab. It's recommended to extract new members on a regular basis.



## How to build it locally

```
yarn install
yarn build
```



The generated script is located in `dist/main.min.js`.
