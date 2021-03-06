//document  
 
  let tanks,
      players = {
        eu: {},
        com: {},
        ru: {}
      },
      currentPlayer;

  var table = {
    player: "",
    sorting: {
      ascending: false,
      defaultColumn: document.querySelector("#battles"), 
      currentColumn: this.defaultColumn
    },
    stats: [],
    getStats: function(server, player) {
      // Reset table info
      this.stats = [];

      for (el of players[server][player]) {

        // Skip stat merging for tanks that don't get returned when getting tank list from the API
        if (tanks[el.tank_id] === undefined) {
          console.log(el.tank_id);
          continue
        };

        // Merge required players' statistics and tank details into an array of objects
        let obj =  {
          ...el,
          ...tanks[el.tank_id]
        }

        this.stats.push(obj);
      }

      // Sort by battles (default)
      this.stats.sort(sortBy("battles", true));

    },
    makeTable: function(player = this.player) {
      console.log("Making a table");



      // Set table HTML to blank
      $('#tanks tbody').html("");

      for (prop of table.stats){

        let output = '<tr>' + 
          '<td><img src=' + prop.images.contour_icon + '></td>' + 
          '<td>' + prop.short_name + '</td>' + 
          '<td>' + '<img src="assets/img/flags/' + prop.nation +'.png"></td>' +
          '<td>' + '<span class="tanktype ' + prop.type + '"></span></td>' +
          '<td>' + prop.tier + '</td>' +
          '<td>' + prop.battle_avg_dmg +
          '<td>' + prop.battle_avg_xp + '</td>' +
          '<td>' + prop.battles + '</td>' +
          '<td>' + prop.win_rate + "%" + '</td>';
  
          if (prop.mark_of_mastery){
            output += '<td>' + '<img src="assets/img/mastery/' + prop.mark_of_mastery + '.png"></td>';
          } else {
            output += '<td></td>'
          };
  
          if (prop.marks_of_excellence){
            output += '<td>' + '<img src="assets/img/marks/' + prop.nation + '_' + prop.marks_of_excellence + '.png" class="moe"></td>';
          } else {
            output += '<td></td>';
          };
  
        output += '</tr>';
  
        $(output).appendTo("#tanks tbody");
      };

      this.player = player;
      $('#name').text(this.player);
      
      showLoading(1);
    }
  }

  getTanks();

  // Search button event listener
  $('#search form button').on("click", sendRequests);

  // Select all table headers except first, then attach event listeners to sort corresponding columns
  const ths = document.querySelectorAll("#tanks th:not(:first-child)")

  for (el of ths) {
    el.addEventListener("click", function(e){
      if (table.sorting.currentColumn === e.target) {
        
        if (table.sorting.ascending) {
          e.target.classList.remove("asc");
          e.target.classList.add("desc")
        } else {
          e.target.classList.remove("desc");
          e.target.classList.add("asc");
        }
        // change sorting direction
        table.sorting.ascending = !table.sorting.ascending;

      } else {
         // save current column selector for future icon reset
        table.sorting.lastColumn = table.sorting.currentColumn;
        // save target column selector
        table.sorting.currentColumn = e.target;
        // reset sorting icon of the last column and set the icon of current column
        if (table.sorting.ascending) {
          table.sorting.lastColumn.classList.remove("asc");
          table.sorting.currentColumn.classList.add("asc");
        } else {
          table.sorting.lastColumn.classList.remove("desc");
          table.sorting.currentColumn.classList.add("desc");
        }
        
      }
      // extract name of the column to sort by it
      let colName = e.target.getAttribute("data-column");
      table.stats.sort(sortBy(colName));
      table.makeTable();
	  });
  };
  

  // Gets a list of all tanks in the game with: is_premium, contour_icon, short_name, nation, tier
  function getTanks(){
    tankList = JSON.parse(sessionStorage.getItem('tankList'));
    
    if (tankList) {
      tanks = tankList;
      console.log('List of tanks retrieved from sessionStorage');
    } else {
      console.log('Sending tankList request')
      $('#loading-text').text("Loading available vehicles...");
      showLoading(3);
      $.ajax({
        method: "GET",
        url: "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&fields=is_premium%2C+images.contour_icon%2C+type%2C+short_name%2C+nation%2C+tier%2C",
        dataType: "json"
      }).done(function(data){
        tanks = data.data;
        sessionStorage.setItem('tankList', JSON.stringify(tanks));
        console.log('List of tanks retrieved from the API and saved to sessionStorage.');
        showLoading(0);
      });
    }
  };

  // Gets players' stats and creates a complete table with all data
  function sendRequests(){
    // prevents page reloading bug after using search
    event.preventDefault();

    let playerID;
    let playerName = $('#search form input').val();
    let server = $("#inlineFormCustomSelectPref").val();

    // Check player name length
    if (playerName.length < 3) {
      window.alert("Minimum length is 3 characters");
      return false;
    }

    // Check for invalid characters
    let regExp = /^[0-9a-zA-Z_]+$/;
    if (!regExp.test(playerName)) {
      window.alert("Please use characters A-Z, numbers and underscores")
      return false;
    }

    currentPlayer = playerName;

    // Show loading animation
    $('#loading-text').text("Loading player statistics...");
    showLoading(2);

    // If players statistics exist in memory - show them, otherwise get them from the API and then show them
    if(players[server][playerName]){
      if (playerName === table.player) {
        table.makeTable();
      } else {
        table.getStats(server, playerName);
        table.makeTable(playerName);
      }
    } else {   
      $.when(
        // Get player ID
        $.ajax({
          method: "GET",
          url: `https://api.worldoftanks.${server}/wot/account/list/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&search=${playerName}&type=exact`,
          dataType: "json"
        }).done(function(data){
          // Check if the player exists
          if (data.meta.count === 1){
            playerID = data.data[0].account_id;
            players[server][playerName] = [];
            console.log('Players\' ID retrieved.' + playerID);
          } else {
            showLoading(0);
            window.alert("Player does not exist!");
          }
        })
      ).then(function() {
        $.when(
      // Get a list of players' tanks + wins, battles, damage dealt, avg. xp and mark of mastery (0-4)
        $.ajax({
          method: "GET",
          url: `https://api.worldoftanks.${server}/wot/tanks/stats/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=all.damage_dealt%2C+all.battles%2C+all.battle_avg_xp%2C+all.wins%2C+mark_of_mastery%2C+tank_id`,
          dataType: "json"
        }).done(function(data){
          if (data.data[playerID]) {

            for (el of data.data[playerID]) {
      
              // Merge required players' statistics and tank details into an array of objects
              let obj =  {
                ...el.all,
                // ...tanks[el.tank_id],
                mark_of_mastery: el.mark_of_mastery,
                tank_id: el.tank_id,
                get win_rate() {
                  return Number(Math.round(this.wins / this.battles +"e4") + "e-2")
                },
                get battle_avg_dmg() {
                  return Number(Math.round(this.damage_dealt / this.battles +"e2")+"e-2")
                }
              }
      
              players[server][playerName].push(obj);
            }
            console.log('Players\' stats retrieved.');
          } else {
            delete players[server][playerName];
            showLoading(0);
            window.alert('Player has no statistics!');
          }
        }),

      // Get a list of players' achievements including Marks of Excellence
        ).then(function() {
          $.ajax({
            method: "GET",
            url: `https://api.worldoftanks.${server}/wot/tanks/achievements/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=achievements%2C+tank_id`,
            dataType: "json"
          }).done(function(data){
            // Store MoE into the object containing other stats
            if(data.data[playerID]) {
              console.log(data.data[playerID]);
              for (let i = 0; i < data.data[playerID].length; i++){
                // Check if a tank has any marks
                if (data.data[playerID][i].achievements.marksOnGun){
                  players[server][playerName][i].marks_of_excellence = data.data[playerID][i].achievements.marksOnGun;
                } else {
                  players[server][playerName][i].marks_of_excellence = 0;
                };
              };
            } else {
                return;
            };
            console.log('Players\' Marks of Excellence retrieved and stored');
            console.log(data.data[playerID])

            table.getStats(server, playerName);
            table.makeTable(playerName);

            table.player = playerName;
            console.log('Done!');
          })
        });
      });
    }
  };

  function sortBy(key, first) {
    if (first) {
      if (table.sorting.lastColumn) {
        table.sorting.ascending = false;
        table.sorting.lastColumn = table.sorting.currentColumn;
        table.sorting.lastColumn.classList.remove("asc", "desc");
      }

      table.sorting.currentColumn = table.sorting.defaultColumn;
      table.sorting.currentColumn.classList.add("desc");
    }

    return function(a, b) {
      if (typeof table.stats[0][key] === "number") {
        // Check sorting direction
        if (table.sorting.ascending) {
          return a[key] - b[key];
        } else {
            return b[key] - a[key];
        }
      } else if (typeof table.stats[0][key] === "string") {
        if (table.sorting.ascending) {
          if (a[key] > b[key]) { return 1; }
          if (a[key] < b[key]) { return -1; }
          return 0;
        } else {
            if (a[key] > b[key]) { return -1; }
            if (a[key] < b[key]) { return 1; }
            return 0;
        }
      }
    };
  };

  function showLoading(status) {
    // Show loading ring only
    if (status === 3) {
      $("#search").addClass("hidden");
      $("table").addClass("hidden");
      $("#name").addClass("hidden");
      $(".loading-wrapper").removeClass("hidden");
      // Show Form and loading ring
    } else if (status === 2) {
      $("table").addClass("hidden");
      $("#name").addClass("hidden");
      $(".loading-wrapper").removeClass("hidden");
      // Hide loading ring and show Table and Name
    } else if (status === 1) {
      $(".loading-wrapper").addClass("hidden");
      $("table").removeClass("hidden");
      $("#name").removeClass("hidden");
      // Hide everything except Form element
    } else {
      $("#search").removeClass("hidden");
      $(".loading-wrapper").addClass("hidden");
      $("table").addClass("hidden");
      $("#name").addClass("hidden");
    }
  };


  function loadingText(text) {
    
  }