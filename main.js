// Yes I know, it's in ES5. I did it on purpose so that it'll work
// in older browsers with needing to convert it with Babel, because
// I couldn't be bothered to look up caniuse.com.

// Base times are in UTC/GMT, via https://www.reddit.com/r/RedDeadOnline/comments/c5wjmc/free_roam_events_schedule/es698ne/
var schedule = [
  ['00:00', 'Master Archer'],
  ['00:45', 'Railroad Baron'],
  ['01:30', 'Wild Animal Kills'],
  ['02:15', 'Fishing Challenge'],
  ['03:00', 'Fool’s Gold'],
  ['03:45', 'Master Archer'],
  ['04:30', 'Kills Challenge'],
  ['05:15', 'King of the Castle'],
  ['06:00', 'Cold Dead Hands'],
  ['06:45', 'Dispatch Rider'],
  ['07:30', 'Railroad Baron'],
  ['08:15', 'Wild Animal Kills'],
  ['09:00', 'Fishing Challenge'],
  ['09:45', 'Fool’s Gold'],
  ['10:30', 'Master Archer'],
  ['11:15', 'Wild Animal Kills'],
  ['12:00', 'King of the Castle'],
  ['12:45', 'Cold Dead Hands'],
  ['13:30', 'Dispatch Rider'],
  ['14:15', 'Railroad Baron'],
  ['15:00', 'Wild Animal Kills'],
  ['15:45', 'Fishing Challenge'],
  ['16:30', 'Fool’s Gold'],
  ['17:15', 'Master Archer'],
  ['18:00', 'Kills Challenge'],
  ['18:45', 'King of the Castle'],
  ['19:30', 'Cold Dead Hands'],
  ['20:15', 'Dispatch Rider'],
  ['21:00', 'Railroad Baron'],
  ['21:45', 'Wild Animal Kills'],
  ['22:30', 'Fishing Challenge'],
  ['23:15', 'Fool’s Gold']
];

var times = document.getElementById('times');
var nextEventName = document.getElementById('next-event-name');
var nextEventTime = document.getElementById('next-event-time');
var eventFrequency = 45 * 60 * 1000;

// Update the list of times, and the
function updateList() {
  var timesList = document.createElement('ul');
  schedule.forEach(function(t) {
    var event = calculateEventTimes(t);
    var li = document.createElement('li');
    if (event.eta > 0 && event.eta < eventFrequency) {
      li.classList.add('next-event');
      nextEventName.innerHTML = event.name;
      nextEventTime.innerHTML = event.timeString;
    }
    li.innerText = event.timeString + ' - ' + event.name;
    timesList.append(li);
  });
  times.innerHTML = timesList.outerHTML;
}

// Convert between time-zones etc
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

// Show the user's time zone in the DOM
function showTimeZone() {
  var timeZone = new Date()
    .toUTCString()
    .split(' ')
    .pop();
  var timeZoneOffset = new Date().getTimezoneOffset() / -60;
  if (timeZoneOffset > 0) {
    timeZoneOffset = '+' + timeZoneOffset;
  }
  document.getElementById('locale').innerText =
    ' (' + timeZone + ' or UTC' + timeZoneOffset + ')';
}

// Initialise
showTimeZone();
updateList();

// Update list every 20 seconds
window.setInterval(updateList, 20000);
