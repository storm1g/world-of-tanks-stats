let playerID = 508501260; // koki1g - 551765902, storm__ - 508501260
let tanks,
    playerStats,
    playerTanks,
    playerMoe;


getTanks();

// Search button event listener
$('.navbar form button').on("click", displayAll);


// Gets players' stats and creates a complete table with all data
function displayAll(){
  getPlayerTankStats();
  setTimeout(makeTable, 4000);
};


function makeTable(){
  for (let i = 0; i < playerStats.data[playerID].length; i++){
    $('<tr>' + '<th><img src=' + tanks.data[playerStats.data[playerID][i].tank_id].images.contour_icon + '></th>' + 
        '<td>' + tanks.data[playerStats.data[playerID][i].tank_id].short_name + '</td>' + 
        '<td>' + tanks.data[playerStats.data[playerID][i].tank_id].nation + '</td>' +
        '<td>' + tanks.data[playerStats.data[playerID][i].tank_id].type + '</td>' +
        '<td>' + tanks.data[playerStats.data[playerID][i].tank_id].tier + '</td>' +
        '<td>' + Number(Math.round(playerStats.data[playerID][i].all.damage_dealt / playerStats.data[playerID][i].all.battles +"e2")+"e-2") + '</td>' +
        '<td>' + playerStats.data[playerID][i].all.battle_avg_xp + '</td>' +
        '<td>' + playerStats.data[playerID][i].all.battles + '</td>' +
        '<td>' + Number(Math.round(playerStats.data[playerID][i].all.wins / playerStats.data[playerID][i].all.battles +"e4") + "e-2") + "%" + '</td>' +
        '<td>' + playerStats.data[playerID][i].mark_of_mastery + '</td>' +
      '</tr>'
    ).appendTo("table tbody");
  }
};

// Gets a list of all tanks in the game with: is_premium, contour_icon, short_name, nation, tier
function getTanks(){
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&fields=is_premium%2C+images.contour_icon%2C+type%2C+short_name%2C+nation%2C+tier%2C", true);

  xhr.onload = function(){
    if(this.status == 200){
      tanks = JSON.parse(this.responseText);
    }
  };

  xhr.send();
};


// Gets a list of players' tanks + wins, battles, damage dealt, avg. xp and mark of mastery (1-4)
function getPlayerTankStats(){
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.worldoftanks.eu/wot/tanks/stats/?application_id=6d2ad8ec3cf857de529a60c5ce6f73f0&account_id=" + playerID + "&fields=all.damage_dealt%2C+all.battles%2C+all.battle_avg_xp%2C+all.wins%2C+mark_of_mastery%2C+tank_id", true);

  xhr.onload = function(){
    if(this.status == 200){
      playerStats = JSON.parse(this.responseText);
    }
  };

  xhr.send();
};