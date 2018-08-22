async function getHtmlTextByUrl(url, callback){
  try {
    const response = await fetch(url);
    const text = await response.text();
    callback(url, text);
  } catch(e) {
    callback('');
  }
}

async function saveRSSFeed(params, callback){
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    };

    const response = await fetch('https://collective-times-api.herokuapp.com/v1/sites', {
      method: 'POST',
      headers: headers,
      body:  JSON.stringify(params)
    });
    const status = await response.ok;
    if(status){
      callback('Feedの登録成功');
    }else{
      callback('Feedの登録失敗');
    }
  } catch(e) {
    callback('Feedの登録失敗');
  }
}

function findFeedsByHtmlBody(url, body, callback){
  if(!url){
    return;
  }
  if(body === ''){
    callback([]);
  }

  const types = [
    'application/rss+xml',
    'application/atom+xml',
    'application/rdf+xml',
    'application/rss',
    'application/atom',
    'application/rdf',
    'text/rss+xml',
    'text/atom+xml',
    'text/rdf+xml',
    'text/rss',
    'text/atom',
    'text/rdf'
  ];

  const parser = new URL(url);
  const contentsUrl = `${parser.protocol}//${parser.host}`;

  document.getElementById('rss-feed-url_response').innerHTML = body;
  const links = document.getElementById('rss-feed-url_response').querySelectorAll("#rss-feed-url_response link[type]");
  document.getElementById('rss-feed-url_response').innerHTML = '';

  let feeds = [];
  for (var i = 0; i < links.length; i++) {
    if (links[i].hasAttribute('type') && types.indexOf(links[i].getAttribute('type')) !== -1) {
      let feedUrl = links[i].getAttribute('href');
      if (feedUrl.indexOf("//") == 0) {
        feedUrl = "http:" + feedUrl;
      } else if (feedUrl.startsWith('/')) {
        feedUrl = url.split('/')[0] + '//' + url.split('/')[2] + feedUrl;
      } else if (/^(http|https):\/\//i.test(feedUrl)) {
        feedUrl = feedUrl;
      } else {
        feedUrl = url + "/" + feedUrl.replace(/^\//g, '');
      }

      feeds.push({
        contentsUrl: contentsUrl,
        feedUrl: feedUrl,
        feedType: links[i].getAttribute('type'),
        feedTitle: feedUrl,
        // 何故かJSONに変換すると狂う
        // feedTitle: links[i].getAttribute('title').replace(' ', '') || feedUrl,
      });
    }
  }

  callback(feeds);
}

function render(html){
  document.getElementById('feeds').innerHTML = html;
}

function onClickFeed(event) {
  const data = JSON.parse(event.target.dataset.feed);
  let params = {
    title: data.contentsUrl,
    feedUrl: data.feedUrl,
    sourceUrl: data.contentsUrl,
    crawlable: true,
    type: "rss"
  };

  saveRSSFeed(params, (resultMessage) => {
    render(resultMessage);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tab = tabs[0];
    let url = tab.url;

    getHtmlTextByUrl(url, (url, body) => {
      findFeedsByHtmlBody(url, body, (feeds) => {
        if(feeds.length === 0){
          render("No feed found");
          return;
        }

        const dataList = feeds.map((feed, index) => {
          const data = JSON.stringify(feed);
          return `<li><button id="feed${index}" data-feed=${data}>${feed.feedTitle}</button></li>`;
        });
        const feedList = feeds.map((feed) => {
          return `<li><a href="${feed.feedUrl}" title="${feed.feedType}" target="_blank">${feed.feedTitle}</a></li>`;
        });
        const html = `<h2>Candidate</h2><ul>${dataList}</ul><h2>Feed</h2><ul>${feedList}</ul>`;
        render(html);

        feeds.forEach((feed, index) => {
          const button = document.getElementById(`feed${index}`);
          button.onclick = onClickFeed;
        });
      });
    });
  });
});
