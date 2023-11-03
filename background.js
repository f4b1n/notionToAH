// add listeners

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "Post") {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: functionWrapper
  });
  }
});

chrome.runtime.onMessage.addListener(async (request) => {
    if (request.openAH) {
    chrome.tabs.create({ url: `https://www.ah.nl`}).then((tab) => {
         chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: postToAh,
            args: [request]
            });
        });
}});

async function functionWrapper() {

    const reference = {
    "Lentils": ["469874", "1"],
    "🐔 ": ["533079", "1"],
    "Frozen berries": ["376521", "1"],
    "Mager rundergehakt": ["436750", "1"],
    "Tartaar": ["436749", "1"],
    " 🥒 ": ["101130", "1"],
    "Kidney beans ": ["190839", "1"],
    "Chili pepper": ["387770", "1"],
    "Paprika": ["425999", "1"],
    "Tortillas": ["425972", "1"],
    "🍆 ": ["239244", "2"],
    "Cottage cheese ": ["400467", "1"],
    "Feta": ["67674", "1"],
    "🫒": ["462229", "1"],
    "Mozzarella": ["186787", "1"],
    "Parsnip": ["203003", "1"],
    "Sour cream": ["3869", "1"],
    "Sweet corn": ["101170", "1"],
    "Paper towel": ["405197", "1"],
    "Tuna": ["368348", "1"],
    "🗑 bags": ["63072", "1"],
    "Small bin bags ": ["480995", "1"],
    "Broccoli": ["466127", "1"],
    "Plastic bags": ["124113", "1"],
    "Ginger": ["104818", "1"],
    "Beef stock": ["457582", "1"],
    "Breadcrumbs": ["196776", "1"],
    "Truffle mayo": ["420244", "1"],
    "🍅 Püree": ["234843", "1"],
    "Chopped 🍅 400g": ["207510", "1"],
    "Figs": ["470158", "1"],
    "Toilet paper": ["489389", "1"],
    "🦆": ["33636", "1"],
    "Gnocchi": ["191055", "1"],
    "🥚": ["127231", "1"],
    "Baking paper": ["221756", "1"],
    "🧅 (Onion)": ["525848", "1"],
    "🌽": ["4162", "1"],
    "Tissues": ["59931", "1"],
    "Parmesan": ["238913", "1"],
    "🍋": ["190654", "1"],
    "Fresh rosemary": ["238972", "1"],
    "Butter": ["58082", "1"],
    "Garlic": ["185774", "1"],
    "Dishwasher liquid": ["479793", "1"],
    "Apricots": ["470027", "1"],
    "Soy sauce": ["376581", "1"],
    "Dishwasher tablets": ["164919", "1"],
    };


    async function getNotionData () {
        const content = document.getElementsByClassName('notion-page-content')[0].children;
        const notionData = [];

        for (let x = 0; x < content.length; x++) {
            if (content[x].querySelector('.checkboxSquare')) { // check for unticked eles 
                let child = content[x].querySelector('.notranslate').innerHTML;
                if (child.includes('emoji')) { // select the emoji if there is one
                    const regex = /alt="([^"]+)".*?>([^<]+)/g;
                    let altText = regex.exec(child);
                    let text = child.split('<')[0];
                    let element = text + altText[1] + altText[2];
                    notionData.push(element.trim());

                    if (reference[element]) {
                        let element = content[x].querySelector('input[type=checkbox]');
                        element.click();    
                    }

                }
                else { // otherwise take the normal element
                    notionData.push(child.trim());
                    
                    if (reference[child.trim()]) {
                        let element = content[x].querySelector('input[type=checkbox]');
                        element.click();    
                    }
                }
            }
        }
        createAhData(notionData);
    };

    async function createAhData(notionData) {
        const ahData = [];

         for (let x = 0; x < notionData.length; x++) {
            const item = notionData[x];
            try {
                ahData.push({"quantity": reference[item][1], "id": reference[item][0]});
            } catch (error) {
                console.log(`Couldn't find ${item}. :(`);
                }
            }

        const data = { "items": ahData };
  
        chrome.runtime.sendMessage({'openAH': data});

    };
    getNotionData();
};

async function postToAh(data) {
    let response = await fetch('https://www.ah.nl/common/api/basket/v2/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data.openAH)
    });

  const responseData = await response.json();

  try {
      alert('Successfully added ' + responseData.summary.quantity + " item(s), for a total of €" + responseData.summary.totalPrice.totalPrice + '!');
  } catch (error) {
      console.log('Something went wrong!');
  }
};