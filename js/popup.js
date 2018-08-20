async function getHtmlTextByUrl(url, callback){
  try {
    const response = await fetch(url);
    const text = await response.text();
    callback(url, text);
  } catch(e) {
    callback('');
  }
}

function findFeedsByHtmlBody(url, body, callback){
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

  document.getElementById('rss-feed-url_response').innerHTML = body;
  const links = document.getElementById('rss-feed-url_response').querySelectorAll("#rss-feed-url_response link[type]");
  document.getElementById('rss-feed-url_response').innerHTML = '';

  let feeds = [];
  for (var i = 0; i < links.length; i++) {
    if (links[i].hasAttribute('type') && types.indexOf(links[i].getAttribute('type')) !== -1) {
      var feed_url = links[i].getAttribute('href');
      if (feed_url.indexOf("//") == 0) {
        feed_url = "http:" + feed_url;
      } else if (feed_url.startsWith('/')) {
        feed_url = url.split('/')[0] + '//' + url.split('/')[2] + feed_url;
      } else if (/^(http|https):\/\//i.test(feed_url)) {
        feed_url = feed_url;
      } else {
        feed_url = url + "/" + feed_url.replace(/^\//g, '');
      }

      feeds.push({
        type: links[i].getAttribute('type'),
        url: feed_url,
        title: links[i].getAttribute('title') || feed_url
      });
    }
  }

  callback(feeds);
}

function render(html){
  document.getElementById('feeds').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;

    getHtmlTextByUrl('http://blog.hypermkt.jp', (url, body) => {
      findFeedsByHtmlBody(url, body, (feeds) => {
        if(feeds.length === 0){
          render("No feed found");
          return;
        }

        const feedList = feeds.map((feed) => {
          return `<li><a href="${feed.url}" title="${feed.type}" target="_blank">${feed.title}</a></li>`;
        });
        const html = `<ul>${feedList}</ul>`;
        render(html);
      });
    });
  });
});
