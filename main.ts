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

interface LinkedInProfile {
    fsdProfile: string
    searchTerm?: string,
    linkedInProfileUrl?: string,
    firstName?: string,
    lastName?: string,
    fullName?: string,
    title?: string,
    location?: string,
    isPremium?: boolean,
    summary?: string,
}

// declare var profiles_list:string[][]; // Will store linkedin profile
declare var profiles_list:Map<string, LinkedInProfile>; // Will store linkedin profile
window.profiles_list = window.profiles_list || new Map();

// [[
//     'First Name',
//     'Last Name',
//     'Headline',
//     'ProfileLink',
//     // 'Full Name',
//     // 'Title',
//     // 'Location',
//     // 'Profile Link',
//     // 'Summary',
//     // 'Is Premium',
//     // 'Connection Degree'
// ]]

// Add a Download button to export parsed records into a CSV file
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
        'bottom: 80px;',
        'right: 130px;',
        'color: white;',
        'min-width: 150px;',
        'background: blue;',
        'border-radius: 8px',
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
    numberSpan.setAttribute('id', 'linkedin-scraper-number-tracker')
    numberSpan.textContent = "0";
    const memberText = document.createTextNode('\u00A0members')

    btn.appendChild(downloadText)
    btn.appendChild(numberSpan)
    btn.appendChild(memberText)

    btn.addEventListener('click', function() {
        const timestamp = new Date().toISOString();

        const profileToArray: string[][] = [[
            'Search Terms',
            'LinkedInUrl',
            'First Name',
            'Last Name',
            'Full Name',
            'Title',
            'Location',
            'Is Premium',
            'Summary'
        ]];

        function textOrEmpty(value){
            return value || ''
        };

        window.profiles_list.forEach((profile, index)=>{
            // Only keep profile with a linkedIn profile URL
            if(profile.linkedInProfileUrl){
                profileToArray.push([
                    profile.searchTerm,
                    profile.linkedInProfileUrl,
                    textOrEmpty(profile.firstName),
                    textOrEmpty(profile.lastName),
                    textOrEmpty(profile.fullName),
                    textOrEmpty(profile.title),
                    textOrEmpty(profile.location),
                    profile.isPremium ? 'True' : 'False',
                    textOrEmpty(profile.summary)
                ])
            }
        })
        exportToCsv(`linkedInProfilesExport-${timestamp}.csv`, profileToArray)
    });

    canvas.appendChild(btn);
    document.body.appendChild(canvas);

    return canvas;
}

function isProfile1(entity){
    return entity['$type'] === "com.linkedin.voyager.dash.search.EntityResultViewModel" && 
    !!entity['navigationUrl'] && entity['navigationUrl'].indexOf('linkedin.com/in/') !== -1;
}

function isProfile2(entity){
    return entity['$type'] === "com.linkedin.voyager.dash.identity.profile.Profile"
    //  &&  !!entity['publicIdentifier']
}

function cleanLinkedInUrl(sourceLinkedInUrl: string): string {
    const cleanedUrl = new URL(sourceLinkedInUrl);
    cleanedUrl.search = ''
    cleanedUrl.hash = ''
    return cleanedUrl.toString();
}

function findProfileUsingFSDProfile(fsdProfile: string){
    for (let [key, value] of window.profiles_list.entries()) {
        if (value.fsdProfile && value.fsdProfile === fsdProfile) {
            return key;
        }
    }
    return null
}

function processResponse(dataGraphQL: any, searchTerm?: string): void{
    // Only look for Group GraphQL responses
    let data: any;
    if(dataGraphQL?.included){
        // Initial Group members page
        data = dataGraphQL?.included;
    } else {
        // If no group members, return fast
        return;
    }

    const profileObjs = data.filter((entity)=>{
        return isProfile1(entity) || isProfile2(entity)
    })

    if(profileObjs.length === 0){
        return
    }

    function parseProfile1(profileNode): LinkedInProfile{
        const profileLink = profileNode?.navigationUrl;

        if(!profileLink){
            return null
        };

        const entityUrn = profileNode?.entityUrn
        let fsdProfile: string;
        const regExResult = entityUrn.match(/fsd_profile:(?<profile>(\w+))/);
        if(regExResult && regExResult.groups && regExResult.groups['profile']) {
            fsdProfile = regExResult.groups['profile']
        }

        if(!fsdProfile){
            return null;
        }
        // "urn:li:fsd_entityResultViewModel:(urn:li:fsd_profile:ACoAACbapPsBIXhvyKSmbAWi_6qcr0hu7HGHzqg,SEARCH_SRP,DEFAULT)"

        const fullName = profileNode?.title?.text;
        const title = profileNode?.primarySubtitle?.text;
        const location = profileNode?.secondarySubtitle?.text;
        const summary = profileNode?.summary?.text;
        let isPremium = false;
        if(profileNode?.badgeIcon){
            isPremium = true;
        }
        // // profileNode?.badgeIcon?.attributes[0]?.detailData?.icon.toLowerCase().indexOf('premium') !== -1;
        // const connectionDegree = profileNode?.badgeText?.accessibilityText;

        const toReturn: LinkedInProfile = {
            fsdProfile: fsdProfile,
            linkedInProfileUrl: cleanLinkedInUrl(profileLink),
            isPremium: isPremium
        }
        if(searchTerm){
            toReturn.searchTerm = searchTerm
        }
        if(fullName){
            toReturn.fullName = fullName;
        }
        if(title){
            toReturn.title = title;
        }
        if(location){
            toReturn.location = location;
        }
        if(summary){
            toReturn.summary = summary;
        }
        return toReturn
    }

    function parseProfile2(profileNode): LinkedInProfile {
        const entityUrn = profileNode?.entityUrn
        let fsdProfile: string;
        if(!entityUrn){
            return null
        }
        const regExResult = entityUrn.match(/fsd_profile:(?<profile>(\w+))/);
        if(regExResult && regExResult.groups && regExResult.groups['profile']) {
            fsdProfile = regExResult.groups['profile']
        }
        if(!fsdProfile){
            return null;
        }

        const toReturn: LinkedInProfile = {
            fsdProfile: fsdProfile
        }

        const publicIdentifier = profileNode?.publicIdentifier;
        const firstName = profileNode?.firstName;
        const lastName = profileNode?.lastName;        
        const headline = profileNode?.headline;
        if(publicIdentifier){
            toReturn.linkedInProfileUrl =`https://www.linkedin.com/in/${publicIdentifier}`
        }
        if(firstName){
            toReturn.firstName = firstName;
        }
        if(lastName){
            toReturn.lastName = lastName;
        }
        if(headline){
            toReturn.title = headline;
        }
        if(searchTerm){
            toReturn.searchTerm = searchTerm
        }
        
        return toReturn
    }


    profileObjs.forEach(profileNode=>{
        console.log(profileNode)
        let profile: LinkedInProfile;
        if(isProfile1(profileNode)){
            profile = parseProfile1(profileNode)
            console.log(`Profile1 ${profile.fullName} - ${profile.firstName} - ${profile.lastName}`)
        }else if(isProfile2(profileNode)){
            profile = parseProfile2(profileNode)
            console.log(`Profile2 ${profile.fullName} - ${profile.firstName} - ${profile.lastName}`)
        }else{
            throw new Error('Invalid profile')
        }

        if(!profile){
            return;
        }

        console.log(`fsdProfile: ${profile.fsdProfile}`)
        const existingProfile = window.profiles_list.get(profile.fsdProfile)
        if(existingProfile){
            console.log('Merge')
            window.profiles_list.set(profile.fsdProfile, {
                ...existingProfile,
                ...profile
            })
        }else{
            window.profiles_list.set(profile.fsdProfile, profile)
        }
    })

    // Update member tracker counter
    const tracker = document.getElementById('linkedin-scraper-number-tracker')
    if(tracker){
        const cleanMap = new Map([...window.profiles_list].filter(([k, v])=>{
            return !!v.linkedInProfileUrl
        }))
        tracker.textContent = cleanMap.size.toString()
    }
}


function parseResponse(dataRaw: string): void{
    // // be sure we are on search url
    // if(window.location.pathname !== "/search/results/people/"){
    //     return;
    // }

    // const keywordReg = window.location.search.match(/keywords=(?<search>.+?)(?=&)/)
    // const keyword = keywordReg && keywordReg.groups && keywordReg.groups['search']

    let dataGraphQL: Array<any> = [];
    try{
        dataGraphQL.push(JSON.parse(dataRaw))
    }catch(err){
        console.error('Fail to parse API response', err);
    }

    for(let j=0; j<dataGraphQL.length; j++){
        processResponse(dataGraphQL[j])
    }
}

function main(): void {
    buildCTABtn()

    // Watch API calls to find GraphQL responses to parse
    const matchingUrl = '/voyager/api/graphql';
    const regstart = /start:(?<start>\d+)/ig
    const increasePagination = 40;
    
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(){
        if(arguments[1].indexOf('/voyager/api/graphql')!=-1){
            const newArgs = arguments;
            const currentUrl = arguments[1];
            regstart.lastIndex = 0;
            const result = regstart.exec(currentUrl);

            if(result){
                const currentStart = result?.groups?.start;
                if(currentStart){
                    const currentPage = parseInt(currentStart)/10;
                    const newStart = currentPage*(10+increasePagination)
                    newArgs[1] = currentUrl.replace(`start:${currentStart}`, `count:${10+increasePagination},start:${newStart}`)
                    return open.apply(this, newArgs);
                }
            }
        }
        return open.apply(this, arguments);
    }
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('readystatechange', function() {
            if (this.responseURL.includes(matchingUrl) && this.readyState === 4) {
                const reader: FileReader = new FileReader();
                reader.onloadend = (e) => {
                    try{
                        // console.log(reader.result)
                        parseResponse(reader.result as string);
                    }catch(err){
                        console.error(err)
                    }
                };
                reader.readAsText(this.response);
            }
        }, false);
        send.apply(this, arguments);
    };
}

main();
