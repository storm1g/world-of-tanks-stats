let tanks,
    playerStats;


getTanks();

// Gets a list of all tanks in the game with: is_premium, contour_icon, short_name, nation, tier
function getTanks(){
  $.ajax({
    method: "GET",
    url: "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&fields=is_premium%2C+images.contour_icon%2C+type%2C+short_name%2C+nation%2C+tier%2C",
    dataType: "json"
  }).done(function(data){
    tanks = data.data;
    console.log('List of tanks retrieved.');
  });
};


// Search button event listener
$('#search form button').on("click", displayStats);

$('#moe').on("click", function(){
  playerStats.sort(function (a, b) {
    return b.all.marksOnGun - a.all.marksOnGun;
  });
  makeTable();
});

$('#mastery').on("click", function(){
  playerStats.sort(function (a, b) {
    return b.mark_of_mastery - a.mark_of_mastery;
  });
  makeTable();
});

$('#battles').on("click", function(){
  playerStats.sort(function (a, b) {
    return b.all.battles - a.all.battles;
  });
  makeTable();
})

// Gets players' stats and creates a complete table with all data
function displayStats(){
  let playerID;
  let playerName = $('#search form input').val();
  let server = $("#inlineFormCustomSelectPref").val();

  $("table").addClass("hidden")
  $(".loading-ring").removeClass("hidden");

  $.when(
    // Gets a players ID
    $.ajax({
      method: "GET",
      url: `https://api.worldoftanks.${server}/wot/account/list/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&search=${playerName}&type=exact`,
      dataType: "json"
    }).done(function(data){
      playerID = data.data[0].account_id;
      console.log('Players\' ID retrieved.' + playerID);
    })
  ).then(function() {
    $.when(
  // Gets a list of players' tanks + wins, battles, damage dealt, avg. xp and mark of mastery (0-4)
    $.ajax({
      method: "GET",
      url: `https://api.worldoftanks.${server}/wot/tanks/stats/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=all.damage_dealt%2C+all.battles%2C+all.battle_avg_xp%2C+all.wins%2C+mark_of_mastery%2C+tank_id`,
      dataType: "json"
    }).done(function(data){
      playerStats = data.data[playerID];
      console.log('Players\' stats retrieved.');
    }),

  // Gets a list of players' achievements including Marks of Excellence
    ).then(function() {
      $.ajax({
        method: "GET",
        url: `https://api.worldoftanks.${server}/wot/tanks/achievements/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=${playerID}&fields=achievements%2C+tank_id`,
        dataType: "json"
      }).done(function(data){
        for (let i = 0; i < data.data[playerID].length; i++){
          if (data.data[playerID][i].achievements.marksOnGun){
            playerStats[i].all.marksOnGun = data.data[playerID][i].achievements.marksOnGun;
          } else {
            playerStats[i].all.marksOnGun = 0;
          }
        }
        // playerMoe = data.data[playerID];
        console.log('Players\' Marks of Excellence retrieved and stored into playerStats.');
        playerStats.sort(function (a, b) {
          return b.all.battles - a.all.battles;
        });
        console.log('playerStats sorted by number of battles');
        makeTable();
      })
    });
  });
};

function makeTable(){
  console.log("making a table");
  
  $('table tbody').html("");

  for (let i = 0, output; i < playerStats.length; i++){

    if (tanks[playerStats[i].tank_id] === undefined) {
      continue
    }

    output = '<tr>' + 
        '<th><img src=' + tanks[playerStats[i].tank_id].images.contour_icon + '></th>' + 
        '<td>' + tanks[playerStats[i].tank_id].short_name + '</td>' + 
        '<td>' + '<img src="assets/img/flags/' + tanks[playerStats[i].tank_id].nation +'.png"></td>' +
        '<td>' + '<span class="tanktype ' + tanks[playerStats[i].tank_id].type + '"></span></td>' +
        '<td>' + tanks[playerStats[i].tank_id].tier + '</td>' +
        '<td>' + Number(Math.round(playerStats[i].all.damage_dealt / playerStats[i].all.battles +"e2")+"e-2") + '</td>' +
        '<td>' + playerStats[i].all.battle_avg_xp + '</td>' +
        '<td>' + playerStats[i].all.battles + '</td>' +
        '<td>' + Number(Math.round(playerStats[i].all.wins / playerStats[i].all.battles +"e4") + "e-2") + "%" + '</td>';

        if (playerStats[i].mark_of_mastery){
          output += '<td>' + '<img src="assets/img/mastery/' + playerStats[i].mark_of_mastery + '.png"></td>';
        } else {
          output += '<td></td>'
        };

        if (playerStats[i].all.marksOnGun){
          output += '<td>' + '<img src="assets/img/marks/' + tanks[playerStats[i].tank_id].nation + '_' + playerStats[i].all.marksOnGun + '.png" class="moe"></td>';
        } else {
          output += '<td></td>';
        };

    output += '</tr>';

    $(output).appendTo("table tbody");
  }

  $(".loading-ring").addClass("hidden");
  $("table").removeClass("hidden");
};

function propComparator(prop) {
  return function(a, b) {
      return b[prop] - a[prop];
  }
}



// playerStats.sort(propComparator('batt'));

// playerStats[0].all.markOfMastery = playerMoe[0].achievements.markOfMastery - dodavanje posebnih statova



/* $.ajax({
        method: "GET",
        url: "https://api.worldoftanks.eu/wot/tanks/achievements/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=" + playerID + "&fields=achievements%2C+tank_id",
        dataType: "json"
      }).done(function(data){
        for (let i = 0; i < data.data[playerID].length; i++){
          playerStats[i].all.marksOnGun = data.data[playerID][i].achievements.marksOnGun;
        }
        // playerMoe = data.data[playerID];
        console.log('Players\' achievements retrieved.');
      })
*/