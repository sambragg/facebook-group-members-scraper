let groupName: string
// Utils to export a Javascript double array into a CSV file
function exportToCsv(filename: string, rows: any[][]): void {
    var processRow = function (row: any[]) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = ((row[j] === null) || (typeof(row[j]) === "undefined")) ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

declare var members_list:string[][]; // Will store facebook group members
window.members_list = window.members_list || [[
    'Profile ID',
    'Full Name',
    'Profile URL',
    'Bio',
    'Joining Text',
    'Group Name',
    'Group ID',
    'Created at'
]]

// Add a Download button to export parsed member into a CSV file
function buildCTABtn(): HTMLElement{
    const canvas = document.createElement('div')
    const canvasStyles = [
        'position: fixed;',
        'top: 0;',
        'left: 0;',
        'z-index: 10;',
        'width: 100%;',
        'height: 100%;',
        'pointer-events: none;'
    ]
    canvas.setAttribute('style', canvasStyles.join(''))

    const btn = document.createElement('div')
    const btnStyles = [
        'position: absolute;',
        'bottom: 30px;',
        'right: 130px;',
        'color: white;',
        'min-width: 150px;',
        'background: var(--primary-button-background);',
        'border-radius: var(--button-corner-radius);',
        'padding: 0px 12px;',
        'cursor: pointer;',
        'font-weight:600;',
        'font-size:15px;',
        'display: inline-flex;',
        'pointer-events: auto;',
        'height: 36px;',
        'align-items: center;',
        'justify-content: center;'
    ]
    btn.setAttribute('style', btnStyles.join(''))

    const downloadText = document.createTextNode('Download\u00A0')
    const numberSpan = document.createElement("span");
    numberSpan.setAttribute('id', 'fb-group-scraper-number-tracker')
    numberSpan.textContent = "0";
    const memberText = document.createTextNode('\u00A0members')

    btn.appendChild(downloadText)
    btn.appendChild(numberSpan)
    btn.appendChild(memberText)

    btn.addEventListener('click', function() {
        const timestamp = new Date().toISOString()
        exportToCsv(`${timestamp} groupMemberExport.csv`, window.members_list)

    });

    canvas.appendChild(btn);
    document.body.appendChild(canvas);

    return canvas;
}

function processResponse(dataGraphQL: any): void{
    // Only look for Group GraphQL responses
    let data: any;
    if(dataGraphQL?.data?.group){
        // Initial Group members page
        data = dataGraphQL.data.group;
    } else if(dataGraphQL?.data?.node?.__typename === 'Group'){
        // New members load on scroll
        data = dataGraphQL.data.node;
    } else if(dataGraphQL?.payload) {
        // Group info
        groupName = dataGraphQL.payload.payload.result.exports.meta.title;
        groupId = dataGraphQL.payload.payload.result.exports.rootView.props.groupID;
        groupUrl = "https://www.facebook.com/groups/".concat(groupId);
    } else {
        // If no group members, return fast
        return;
    }

    let membersEdges: Array<any>;
    // Both are used (new_forum_members seems to be the new way)
    if(data?.new_members?.edges){
        membersEdges = data.new_members.edges;
    }else if(data?.new_forum_members?.edges){
        membersEdges = data.new_forum_members.edges;
    }else if(data?.search_results?.edges){
        membersEdges = data.search_results.edges;
    }else{
        return
    }

    const membersData = membersEdges.map(memberNode=>{
        // Member Data
        const {
            id,
            name,
            bio_text,
            url,
            __isProfile:profileType
        } = memberNode.node

        // Group Joining Info
        const joiningText = memberNode?.join_status_text?.text || memberNode?.membership?.join_status_text?.text;

        // Facebook Group Info
        const groupId = memberNode.node.group_membership?.associated_group.id

        return [
            id,
            name,
            url,
            bio_text?.text || '',
            joiningText || '',
            groupName || '',
            groupId,
            new Date().toISOString()
        ]
    })

    window.members_list.push(...membersData)

    // Update member tracker counter
    const tracker = document.getElementById('fb-group-scraper-number-tracker')
    if(tracker){
        tracker.textContent = window.members_list.length.toString()
    }
}

function parseResponse(dataRaw: string): void{
    let dataGraphQL: Array<any> = [];
    dataRaw = dataRaw.replace('for (;;);', '')
    try{
        dataGraphQL.push(JSON.parse(dataRaw))
    }catch(err){
        // Sometime Facebook return multiline response
        const splittedData = dataRaw.split("\n");

        // If not a multiline response
        if(splittedData.length<=1){
            console.error('Fail to parse API response', err);
            return;
        }

        // Multiline response. Parse each response
        for(let i=0; i<splittedData.length;i++){
            const newDataRaw = splittedData[i];
            try{
                dataGraphQL.push(JSON.parse(newDataRaw));
            }catch(err2){
                console.error('Fail to parse API response', err);
            }
        }
    }

    for(let j=0; j<dataGraphQL.length; j++){
        processResponse(dataGraphQL[j])
    }
}

function autoScrollDown() {
    window.scrollTo(0,document.body.scrollHeight);
}

function main(): void {
    function responseListener(matchingUrl: string): void{
        // Watch API calls to find responses to parse
        let send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('readystatechange', function() {
                if (this.responseURL.includes(matchingUrl) && this.readyState === 4) {
                    parseResponse(this.responseText);
                    const scroller = setInterval(autoScrollDown,500);
                }
            }, false);
            send.apply(this, arguments);
        };
    }
    
    responseListener('/ajax/navigation/');
    responseListener('/api/graphql/');

    buildCTABtn()
}

main();
console.info('Script loaded successfully!')
console.info('To stop the auto-scrolling, paste this into the console: javascript:clearInterval(scroller)')
