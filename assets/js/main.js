let playerID = 508501260; // koki1g - 551765902, storm__ - 508501260
let tanks,
    playerStats,
    playerTanks;


getTanks();



// Gets a list of all tanks in the game + premium status, contour icon, short name, nation, tier
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
