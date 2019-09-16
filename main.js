// Written in ES5 so that it'll work in older browsers without transpilation.
// Probably unnecessary but whatever, don't @ me

(function() {
  // Frequency in minutes
  var eventFrequency = {
    freeRoam: 45,
    role: 90
  };

  // Select DOM elements
  var elements = {
    freeRoam: {
      container: document.getElementById('free-roam-schedule'),
      nextEventName: document.getElementById('next-fr-event-name'),
      nextEventTime: document.getElementById('next-fr-event-time'),
      nextEventEta: document.getElementById('next-fr-event-eta')
    },
    role: {
      container: document.getElementById('role-schedule'),
      nextEventName: document.getElementById('next-role-event-name'),
      nextEventTime: document.getElementById('next-role-event-time'),
      nextEventEta: document.getElementById('next-role-event-eta')
    },
    locale: document.getElementById('locale')
  };

  /**
   * Update the list of event times
   * @param {Array} schedule List of event times
   * @param {string} key Object property key (either freeRoam/role)
   */
  function updateList(schedule, key) {
    var el = elements[key];
    var frequency = minutesToMilliseconds(eventFrequency[key]);
    var list = document.createElement('ul');
    schedule.forEach(function(t, i) {
      var event = calculateEventTimes(t);
      var li = document.createElement('li');
      if (event.eta > 0 && event.eta < frequency) {
        li.classList.add('next-event');
        el.nextEventName.innerHTML = event.name;
        el.nextEventTime.innerHTML = event.timeString;
        el.nextEventEta.innerHTML = event.etaText;
      }
      li.append(getAnchor(key.toLowerCase() + (i + 1)));
      li.append(event.timeString + ' - ' + event.name);
      if (event.role) {
        var role = document.createElement('span');
        role.innerText = ' (' + event.role + ')';
        li.append(role);
      }
      list.append(li);
    });
    el.container.innerHTML = list.outerHTML;
  }

  /**
   * Create an anchor link
   * @param {string} id Unique identifier
   * @return {Node} anchor link element
   */
  function getAnchor(id) {
    var anchor = document.createElement('a');
    anchor.setAttribute('id', id);
    anchor.setAttribute('href', '#' + id);
    anchor.innerText = '#';
    return anchor;
  }

  /**
   * Convert minutes to milliseconds
   * @param {number} t Time in minutes
   * @return {number} Time in milliseconds
   */
  function minutesToMilliseconds(t) {
    return t * 60 * 1000;
  }

  /**
   * Format the event datum and perform time-zone calculations
   * @param {Array} d Event datum containing time and name
   * @return {Object} Formatted event datum
   */
  function calculateEventTimes(d) {
    var eventTime = d[0];
    var now = new Date();
    var eventDateTime = new Date(
      [now.toDateString(), eventTime, 'UTC'].join(' ')
    );
    var eta = eventDateTime - now;
    // Ensure that all event dates are in the future, to fix timezone bug
    if (eta <= 0) {
      var tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      eventDateTime = new Date(
        [tomorrow.toDateString(), eventTime, 'UTC'].join(' ')
      );
      eta = eventDateTime - now;
    }
    return {
      dateTime: eventDateTime,
      name: d[1],
      role: d[2],
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
    var date = new Date();
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
    elements.locale.innerText = ' (' + getTimezone() + ')';
  }

  /**
   * Update both lists
   */
  function update() {
    updateList(freeRoamEvents, 'freeRoam');
    updateList(roleEvents, 'role');
  }

  // Initialise
  showTimeZone();
  update();

  // Update event list every 10 seconds
  window.setInterval(update, 10000);
})();

//--- Theme switcher ---//
(function() {
  var localStorageKey = 'rdr2-freeroam-schedule-theme';
  var THEMES = ['dark', 'light'];
  var themeButton = document.querySelector('#theme');
  // Detect localstorage value and use that if it exists
  var currentTheme = localStorage.getItem(localStorageKey) || THEMES[1];
  updateTheme(currentTheme);

  function updateTheme(theme, updateStorage) {
    THEMES.forEach(function(d) {
      document.body.classList.remove(d);
    });
    document.body.classList.add(theme);
    if (updateStorage) {
      localStorage.setItem(localStorageKey, theme);
    }
    currentTheme = theme;
  }

  // Toggle theme on button click
  themeButton.addEventListener('click', function() {
    var newTheme = THEMES.find(function(d) {
      return d !== currentTheme;
    });
    updateTheme(newTheme, true);
  });
})();

//--- Initialise Disqus ---//
(function() {
  var disqus_shortname = 'richardwestenra';
  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (
    document.getElementsByTagName('head')[0] ||
    document.getElementsByTagName('body')[0]
  ).appendChild(dsq);
})();
