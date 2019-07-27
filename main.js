// Written in ES5 so that it'll work in older browsers
// without transpilation (if still necessary?)

var eventFrequency = 45 * 60 * 1000;

// Select DOM elements
var times = document.getElementById('times');
var nextEventName = document.getElementById('next-event-name');
var nextEventTime = document.getElementById('next-event-time');
var locale = document.getElementById('locale');

/**
 * Update the list of event times
 */
function updateList() {
  var timesList = document.createElement('ul');
  schedule.forEach(function(t, i) {
    var event = calculateEventTimes(t);
    var li = document.createElement('li');
    if (event.eta > 0 && event.eta < eventFrequency) {
      li.classList.add('next-event');
      nextEventName.innerHTML = event.name;
      nextEventTime.innerHTML = event.timeString;
    }
    li.append(getAnchor(i + 1));
    li.append(event.timeString + ' - ' + event.name);
    timesList.append(li);
  });
  times.innerHTML = timesList.outerHTML;
}

/**
 * Create an anchor link
 * @param {number} index
 * @return {Node} anchor link element
 */
function getAnchor(index) {
  var anchor = document.createElement('a');
  anchor.setAttribute('id', index);
  anchor.setAttribute('href', '#' + index);
  anchor.innerText = '#';
  return anchor;
}

/**
 * Format the event datum and perform time-zone calculations
 * @param {Array} t Event datum containing time and name
 * @return {Object} Formatted event datum
 */
function calculateEventTimes(t) {
  var eventTime = t[0];
  var currentDate = new Date().toDateString();
  var eventDateTime = new Date([currentDate, eventTime, 'UTC'].join(' '));
  return {
    dateTime: eventDateTime,
    name: t[1],
    eta: eventDateTime - new Date(),
    timeString: eventDateTime.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Update the user's time zone in intro paragraph
 */
function showTimeZone() {
  var timeZone = new Date()
    .toUTCString()
    .split(' ')
    .pop();
  var timeZoneOffset = new Date().getTimezoneOffset() / -60;
  if (timeZoneOffset > 0) {
    timeZoneOffset = '+' + timeZoneOffset;
  }
  locale.innerText = ' (' + timeZone + ' or UTC' + timeZoneOffset + ')';
}

// Initialise
showTimeZone();
updateList();

// Update event list every 20 seconds
window.setInterval(updateList, 20000);

// Initialise Disqus
var disqus_shortname = 'richardwestenra';
var dsq = document.createElement('script');
dsq.type = 'text/javascript';
dsq.async = true;
dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
(
  document.getElementsByTagName('head')[0] ||
  document.getElementsByTagName('body')[0]
).appendChild(dsq);
