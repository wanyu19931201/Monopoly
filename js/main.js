class Player {
    constructor(name, money, position) {
        this.name = name;
        this.money = money;
        this.position = position;
        this.stop_round = 0;
    }
}
class Card {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    show_info() {

        var info = "";
        if (this.type.includes('Get')) {
            info = this.type + " $" + this.value;
        }
        else if (this.type.includes('Pay')) {
            info = this.type + " $" + this.value * (-1);
        }
        else {
            if (parseInt(this.value) > 1)
                info = this.type + " " + this.value + " days";
            else
                info = this.type + " " + this.value + " day";
        }
        return info;
    }
}

$(document).ready(function () {
    var players = new Array();
    var player1 = new Player("player1", 300, "blank0");
    var player2 = new Player("player2", 300, "blank0");
    var player3 = new Player("player3", 300, "blank0");
    var player4 = new Player("player4", 300, "blank0");
    players.push(player1);
    players.push(player2);
    players.push(player3);
    players.push(player4);


    var currentPlayer_index = 0;
    var current_player;

    $("#" + players[currentPlayer_index].name).css("background-color", "red");

    //create map

    $('.blank').not('.prison').not('.draw_card').not('.roll_again').not('.start').each(function (index) {

        $(this).css("background-color", "yellow");
        var value = Math.floor(Math.random() * 20) + 1;

        var template_parameter = {
            price: value
        }

        var source = $("#blank_template").html(); //Get templete
        var blank_template = Handlebars.compile(source);
        var blank = blank_template(template_parameter);
        $(this).append(blank);
    });

    $("#roll").click(function () {

        current_player = players[currentPlayer_index];

        //Get current position
        var current_player_position = parseInt(current_player.position.split("blank")[1]);

        //Roll dice
        var dice_value = Math.floor((Math.random() * 6) + 1);

        var img_src = "image/die" + dice_value + ".png";
        $("#dice").attr("src", img_src);
        //console.log(current_player);



        //Get other players in same position
        var other_players = $("#blank" + current_player_position).find(".players").html();
        other_players = other_players.replace(" p" + (currentPlayer_index + 1), "");
        $("#blank" + current_player_position).find(".players").html(other_players);

        //move play to new position
        //get now player in new position
        var new_position = current_player_position + dice_value
        if (new_position >= 28) {
            new_position -= 28;
        }

        other_players = $("#blank" + new_position).find(".players").html();
        $("#blank" + new_position).find(".players").html(other_players + " p" + (currentPlayer_index + 1));
        current_player.position = "#blank" + new_position;
        //show message
        var message = current_player.name + " move to blank" + new_position;
        $("#show_message").append("<p>" + message + "</p>");
        move_to_new_position(current_player, new_position, players);


    });

    $("#draw").click(function () {
        console.log("Player" + (currentPlayer_index + 1) + " draws a card!");
        var card_type = Math.floor(Math.random() * 20);
        console.log(card_type);

        if (card_type <= 2) {
            var day = Math.floor(Math.random() * 3) + 1;
            var get_card = new Card("Go to prison", day);
            players[currentPlayer_index].stop_round = day;
        }
        else if (card_type <= 11) {
            var money = Math.floor(Math.random() * 20) + 1;
            var get_card = new Card("Get money", money);
            players[currentPlayer_index].money += money;

        }
        else {
            var money = Math.floor(Math.random() * 20) + 1;
            var get_card = new Card("Pay money", money * (-1));
            players[currentPlayer_index].money += money;
        }
        show_message(players[currentPlayer_index].name + ":" + get_card.show_info())
        console.log(players[currentPlayer_index].name + ":" + get_card.show_info());




        //update information
        cards_length = $("#function_draw_cards").find('span').html();
        var dice_value = Math.floor((Math.random() * cards_length) + 1);
        cards_length--;
        var card_content = "You get card NO." + dice_value;
        if (cards_length == 0) {
            alert("Re-draw all the cards");

            cards_length = 40;
        }
        $("#card").find('p').html(get_card.show_info());
        $("#function_draw_cards").find('span').html(cards_length);

        //set button
        $("#roll").removeAttr('disabled');
        $("#draw").attr('disabled', 'disabled');
        move_to_next_player();

    });

    $("#buy").click(function () {

        var player = players[currentPlayer_index];
        var current_blank = $(player.position);
        var position_price = parseInt(current_blank.find(".price").html());
        if (player.money < position_price) {
            alert("You do not have enough money.");
        }
        else {
            player.money -= position_price;
            current_blank.find(".owner").html(player.name);
            current_blank.find(".house_count").html(1);
            //$("#"+player.name).find(".money").html(player.money); 
            // console.log("spend $" + position_price + " on buying this positon");
            var message = current_player.name + " spends $" + position_price + " on buying this positon";
            show_message(message);
            for (var i = 0; i < players.length; i++) {
                if (players[i].name == player.name) {
                    players[i].money = player.money;
                }
            }
        }

        $("#roll").removeAttr('disabled');
        $("#buy").attr('disabled', 'disabled');
        $("#skip").attr('disabled', 'disabled');
        move_to_next_player();

    });
    $("#skip").click(function () {

        $("#roll").removeAttr('disabled');
        $("#buy").attr('disabled', 'disabled');
        $("#skip").attr('disabled', 'disabled');
        move_to_next_player();

        show_message(current_player.name + "does not buy this position and switch to next player!")


    });
    function show_message(message) {
        $("#show_message").append("<p>" + message + "</p>");
    }
    function get_owner(blank_id) {
        var owner = $("#blank" + blank_id).find(".owner").html();
        return owner;
    }

    function move_to_new_position(player, position_id, players) {

        var current_blank = $("#blank" + position_id);
        if (current_blank.has('.function').length > 0) {//function blank

            var blank_function = current_blank.find(".function").html();

            if (blank_function.includes("card")) {
                $("#draw").removeAttr('disabled');
                $("#roll").attr('disabled', 'disabled');
                show_message(current_player.name + " can draw a card.   ")
            } else if (blank_function.includes("Prison")) {
                player.stop_round = 1;
                console.log(player.name + ": Go to prison 1 day!");
            }


        } else {// non function blank
            var position_price = parseInt(current_blank.find(".price").html());
            if (get_owner(position_id) == "Empty") {
                //Empty position

                $("#buy").removeAttr('disabled');
                $("#skip").removeAttr('disabled');
                $("#roll").attr('disabled', 'disabled');




                /*
                var check_buy= confirm("Do you want to buy this position?");
                
                if(check_buy){
                    if(player.money < position_price){
                        alert("You do not have enough money.");
                    }
                    else{
                        player.money-=position_price;
                        current_blank.find(".owner").html(player.name);
                        current_blank.find(".house_count").html(1);
                        //$("#"+player.name).find(".money").html(player.money); 
                        console.log("spend $"+position_price+" on buying this positon");
                        for(var i=0;i<players.length;i++){
                            if(players[i].name==player.name){
                                players[i].money=player.money;
                            } 
                        }  
                    }
                }
                */

            } else if (get_owner(position_id) == player.name) {
                //Own position
                console.log("You can build a house");
                var check_build = confirm("Do you want to build another house?");
                if (check_build) {
                    if (player.money < position_price) {
                        alert("You do not have enough money.");
                    }
                    else {
                        player.money -= position_price;
                        current_blank.find(".owner").html(player.name);
                        var get_count_house = parseInt(current_blank.find(".house_count").html());
                        get_count_house++;
                        current_blank.find(".house_count").html(get_count_house);
                        //$("#"+player.name).find(".money").html(player.money); 
                        console.log("spend $" + position_price + " on building another house!");
                        for (var i = 0; i < players.length; i++) {
                            if (players[i].name == player.name) {
                                players[i].money = player.money;
                            }
                        }
                    }

                }
                move_to_next_player();
            } else {
                //Other player's position
                var get_count_house = parseInt(current_blank.find(".house_count").html());
                var get_position_owner = current_blank.find(".owner").html();
                player.money -= get_count_house * position_price;
                //$("#"+player.name).find('.money').html(player.money);

                for (var i = 0; i < players.length; i++) {
                    if (players[i].name == player.name)
                        players[i].money = player.money;

                    if (players[i].name == get_position_owner) {
                        players[i].money += get_count_house * position_price;
                        //$("#"+get_position_owner).find('.money').html(players[i].money);
                    }

                }
                console.log("You need to pay $" + get_count_house * position_price + " to " + get_position_owner);
                move_to_next_player();
            }


        }
    }
    function move_to_next_player() {

        $("#player" + (currentPlayer_index + 1)).css("background-color", "bisque");
        currentPlayer_index++;
        if (currentPlayer_index == 4)
            currentPlayer_index = 0;
        $("#player" + (currentPlayer_index + 1)).css("background-color", "red");
        for (var i = 0; i < players.length; i++) {
            $("#" + players[i].name).find(".money").html(players[i].money);
        }

        if (players[currentPlayer_index].stop_round > 0) {
            console.log(players[currentPlayer_index].name + " is in the prison! Switch to next player!");
            players[currentPlayer_index].stop_round--;
            move_to_next_player();
        }
        else if (players[currentPlayer_index].stop_round < 0) {
            console.log(players[currentPlayer_index].name + " is broken! Switch to next player!");
            move_to_next_player();
        }

    }
});

