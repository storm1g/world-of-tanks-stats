let playerID = 508501260; // koki1g - 551765902, storm__ - 508501260
let tanks;
    // playerStats,
    // playerMoe;


getTanks();

// Gets a list of all tanks in the game with: is_premium, contour_icon, short_name, nation, tier
function getTanks(){
  $.ajax({
    method: "GET",
    url: "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&fields=is_premium%2C+images.contour_icon%2C+type%2C+short_name%2C+nation%2C+tier%2C",
    dataType: "json"
  }).done(function(data){
    tanks = data.data;
    console.log('Tanks list retrieved.');
  });
};


// Search button event listener
$('.navbar form button').on("click", displayAll);


// Gets players' stats and creates a complete table with all data
function displayAll(){
  let playerStats;
  let playerMoe;

  $.when(
  // Gets a list of players' tanks + wins, battles, damage dealt, avg. xp and mark of mastery (0-4)
    $.ajax({
      method: "GET",
      url: "https://api.worldoftanks.eu/wot/tanks/stats/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=" + playerID + "&fields=all.damage_dealt%2C+all.battles%2C+all.battle_avg_xp%2C+all.wins%2C+mark_of_mastery%2C+tank_id",
      dataType: "json"
    }).done(function(data){
      playerStats = data.data[playerID];
      console.log('Players\' stats retrieved.');
    }),

  // Gets a list of players' achievements including Marks of Excellence
    $.ajax({
      method: "GET",
      url: "https://api.worldoftanks.eu/wot/tanks/achievements/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=" + playerID + "&fields=achievements%2C+tank_id",
      dataType: "json"
    }).done(function(data){
      playerMoe = data.data[playerID];
      console.log('Players\' achievements retrieved.');
    })

  ).then(makeTable);

  // function checkMoe(achi, mark){
  //   if (achi.hasOwnProperty("marksOnGun")){ 
  //     return mark;
  //   }
  // }


  function makeTable(){
    for (let i = 0, output; i < playerStats.length; i++){
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

          if (playerMoe[i].achievements.marksOnGun){
            output += '<td>' + '<img src="assets/img/marks/' + tanks[playerStats[i].tank_id].nation + '_' + playerMoe[i].achievements.marksOnGun + '.png" class="moe"></td>';
          } else {
            output += '<td></td>';
          };

      output += '</tr>';

      $(output).appendTo("table tbody");
    }
  };

};