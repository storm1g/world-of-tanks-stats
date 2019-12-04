//document  
 
  let tanks,
      table,
      players = {},
      currentPlayer;

  getTanks();

  // Search button event listener
  $('#search form button').on("click", displayStats);

  // Sorting
  /*$('#moe').on("click", function(){
    playerStats.sort(sortBy("all", "marksOnGun"));
    makeTable();
  }); */
  

  // Gets a list of all tanks in the game with: is_premium, contour_icon, short_name, nation, tier
  function getTanks(){
    tankList = JSON.parse(localStorage.getItem('tankList'));
    
    if (tankList) {
      tanks = tankList;
      console.log('List of tanks retrieved from localStorage');
    } else {
      console.log('sending tankList request')
      $.ajax({
        method: "GET",
        url: "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&fields=is_premium%2C+images.contour_icon%2C+type%2C+short_name%2C+nation%2C+tier%2C",
        dataType: "json"
      }).done(function(data){
        tanks = data.data;
        localStorage.setItem('tankList', JSON.stringify(tanks));
        console.log('List of tanks retrieved from the API and saved to localStorage.');
      });
    }
  };

  // Gets players' stats and creates a complete table with all data
  function displayStats(){
    // prevents page reloading bug after using search
    event.preventDefault();

    let playerID;
    let playerName = $('#search form input').val();
    let server = $("#inlineFormCustomSelectPref").val();
    currentPlayer = playerName;

    // Check player name length
    if (playerName.length < 3) {
      window.alert("Minimum length is 3 characters");
      return false;
    }

    // Check invalid characters
    let regExp = /^[0-9a-zA-Z_]+$/;
    if (!regExp.test(playerName)) {
      window.alert("Please use characters A-Z, numbers and underscores")
      return false;
    }

    // Show loading animation
    showLoading(1);

    // If players statistics exist in memory - show them, otherwise get them from the API and then show them
    if(players[playerName]){
      console.log(playerName);
      makeTable();
    } else {   
      $.when(
        // Gets player ID
        $.ajax({
          method: "GET",
          url: `https://api.worldoftanks.${server}/wot/account/list/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&search=${playerName}&type=exact`,
          dataType: "json"
        }).done(function(data){
          // Checks if the player exists
          if (data.meta.count === 1){
            playerID = data.data[0].account_id;
            players[playerName] = {};
            console.log('Players\' ID retrieved.' + playerID);
          } else {
            $(".loading-ring").addClass("hidden");
            window.alert("Player does not exist!");
          }
        })
      ).then(function() {
        $.when(
      // Gets a list of players' tanks + wins, battles, damage dealt, avg. xp and mark of mastery (0-4)
        $.ajax({
          method: "GET",
          url: `https://api.worldoftanks.${server}/wot/tanks/stats/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=all.damage_dealt%2C+all.battles%2C+all.battle_avg_xp%2C+all.wins%2C+mark_of_mastery%2C+tank_id`,
          dataType: "json"
        }).done(function(data){
          if (data.data[playerID]) {
            players[playerName] = data.data[playerID];
            console.log('Players\' stats retrieved.');
          } else {
            window.alert('Player has no statistics!');
          }
        }),

      // Gets a list of players' achievements including Marks of Excellence
        ).then(function() {
          $.ajax({
            method: "GET",
            url: `https://api.worldoftanks.${server}/wot/tanks/achievements/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=achievements%2C+tank_id`,
            dataType: "json"
          }).done(function(data){
            // Stores MoE into the object containing other stats
            if(data.data[playerID]) {
              console.log(data.data[playerID]);
              for (let i = 0; i < data.data[playerID].length; i++){
                // Check if a tank has any marks
                if (data.data[playerID][i].achievements.marksOnGun){
                  players[playerName][i].all.marksOnGun = data.data[playerID][i].achievements.marksOnGun;
                } else {
                  players[playerName][i].all.marksOnGun = 0;
                };
              };
            } else {

              return;
            };
            console.log('Players\' Marks of Excellence retrieved and stored');

            makeTable();

            console.log('Done!');
          })
        });
      });
    }
  };

  function makeTable(){
    console.log("Making a table");
    
    // Set table HTML to blank
    $('table tbody').html("");

    // for (let i = 0, output; i < player.length; i++){

    //   // Checks if there are any stats for the tank (wot API ignores old, removed/replaced, and some premium tanks)
    //   if (tanks[player[i].tank_id] === undefined) {
    //     console.log(i);
    //     continue
    //   };

    //   output = '<tr>' + 
    //       '<th><img src=' + tanks[player[i].tank_id].images.contour_icon + '></th>' + 
    //       '<td>' + tanks[player[i].tank_id].short_name + '</td>' + 
    //       '<td>' + '<img src="assets/img/flags/' + tanks[player[i].tank_id].nation +'.png"></td>' +
    //       '<td>' + '<span class="tanktype ' + tanks[player[i].tank_id].type + '"></span></td>' +
    //       '<td>' + tanks[player[i].tank_id].tier + '</td>' +
    //       '<td>' + Number(Math.round(player[i].all.damage_dealt / player[i].all.battles +"e2")+"e-2") + '</td>' +
    //       '<td>' + player[i].all.battle_avg_xp + '</td>' +
    //       '<td>' + player[i].all.battles + '</td>' +
    //       '<td>' + Number(Math.round(player[i].all.wins / player[i].all.battles +"e4") + "e-2") + "%" + '</td>';

    //       if (player[i].mark_of_mastery){
    //         output += '<td>' + '<img src="assets/img/mastery/' + player[i].mark_of_mastery + '.png"></td>';
    //       } else {
    //         output += '<td></td>'
    //       };

    //       if (player[i].all.marksOnGun){
    //         output += '<td>' + '<img src="assets/img/marks/' + tanks[player[i].tank_id].nation + '_' + player[i].all.marksOnGun + '.png" class="moe"></td>';
    //       } else {
    //         output += '<td></td>';
    //       };

    table = [];

    for (prop of players[currentPlayer]) {
      if (tanks[prop.tank_id] === undefined) {
        console.log(prop.tank_id);
        continue
      };

      let obj =  {
        ...prop.all,
        ...tanks[prop.tank_id],
        mark_of_mastery: prop.mark_of_mastery,
        tank_id: prop.tank_id,
        get win_rate() {
          return Number(Math.round(this.wins / this.battles +"e4") + "e-2") + "%"
        },
        get battle_avg_dmg() {
          return Number(Math.round(this.damage_dealt / this.battles +"e2")+"e-2")
        }
      }

      table.push(obj);
    }

    table.sort(sortBy("battles"));

    for (prop of table){

     let output = '<tr>' + 
        '<th><img src=' + prop.images.contour_icon + '></th>' + 
        '<td>' + prop.short_name + '</td>' + 
        '<td>' + '<img src="assets/img/flags/' + prop.nation +'.png"></td>' +
        '<td>' + '<span class="tanktype ' + prop.type + '"></span></td>' +
        '<td>' + prop.tier + '</td>' +
        '<td>' + prop.battle_avg_dmg +
        '<td>' + prop.battle_avg_xp + '</td>' +
        '<td>' + prop.battles + '</td>' +
        '<td>' + prop.win_rate + '</td>';

        if (prop.mark_of_mastery){
          output += '<td>' + '<img src="assets/img/mastery/' + prop.mark_of_mastery + '.png"></td>';
        } else {
          output += '<td></td>'
        };

        if (prop.marksOnGun){
          output += '<td>' + '<img src="assets/img/marks/' + prop.nation + '_' + prop.marksOnGun + '.png" class="moe"></td>';
        } else {
          output += '<td></td>';
        };


      output += '</tr>';

      $(output).appendTo("table tbody");
    };

    showLoading(0);
  };

  function sortBy(prop) {
    return function(a, b) {
      if (prop) {
        return b[prop] - a[prop];
      } else {
          return b[prop] - a[prop];
      };
    };
  };

  function showLoading(status) {
    if(status === 1) {
      $("table").addClass("hidden")
      $(".loading-ring").removeClass("hidden");
    } else {
      $(".loading-ring").addClass("hidden");
      $("table").removeClass("hidden");
    }
  };
