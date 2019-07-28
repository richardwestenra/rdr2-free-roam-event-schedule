// Written in ES5 so that it'll work in older browsers
// without transpilation (if still necessary?)

var eventFrequency = 45 * 60 * 1000;
var date = new Date();

// Select DOM elements
var times = document.getElementById('times');
var nextEventName = document.getElementById('next-event-name');
var nextEventTime = document.getElementById('next-event-time');
var nextEventEta = document.getElementById('next-event-eta');
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
      nextEventEta.innerHTML = event.etaText;
      console.log(event);
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
  var currentDate = date.toDateString();
  var eventDateTime = new Date([currentDate, eventTime, 'UTC'].join(' '));
  var eta = eventDateTime - date;
  return {
    dateTime: eventDateTime,
    name: t[1],
    eta: eta,
    etaText: getEtaText(eta),
    timeString: eventDateTime.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Display time remaining in minutes or seconds
 * @param {number} t Time in milliseconds
 * @return {string} e.g. 1 minute, 35 minutes, 1 second, 40 seconds, etc.
 */
function getEtaText(t) {
  t = t / 1000; // convert to seconds
  function s(t) {
    return t === 1 ? '' : 's';
  }
  if (t < 60) {
    return Math.round(t) + ' second' + s(t);
  }
  t = Math.round(t / 60); // convert to minutes
  return t + ' minute' + s(t);
}

/**
 * Get the name or abbreviation for the user's time zone
 * @return {string} e.g. GMT or Greenwich Mean Time or UTC+5
 */
function getTimezone() {
  // Generate long time-zone name
  var longTimeZone = date.toString().match(/\((.+)\)/);
  if (longTimeZone) {
    return longTimeZone[1];
  }
  // Fall back to short code if that one is null
  var shortTimeZone = date
    .toLocaleTimeString('en-us', { timeZoneName: 'short' })
    .split(' ');
  if (shortTimeZone) {
    return shortTimeZone[2];
  }
  // Finally, fall back to time-zone offset
  var timeZoneOffset = date.getTimezoneOffset() / -60;
  if (timeZoneOffset > 0) {
    timeZoneOffset = '+' + timeZoneOffset;
  }
  return 'GMT' + timeZoneOffset;
}

/**
 * Update the user's time zone in intro paragraph
 */
function showTimeZone() {
  locale.innerText = ' (' + getTimezone() + ')';
}

// Initialise
showTimeZone();
updateList();

// Update event list every 10 seconds
window.setInterval(updateList, 10000);

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
