const webSocket = require('ws')

const wss = new  webSocket.Server({port:8080})
console.log("webSocket Server Started...")

let first //first player
let counter = 0
let colour = "blue" //colour for first player
let turn = 0
let movesLeft = [ 5 , 5 , 5 , 5 , 5 , 5 , 5 ] //To check position to place checker from the last row

let array =      [[ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],		//grid
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],	
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],]

const changeTurn = () => {
	if(turn == 1 )
	{
		colour = " red " 
		turn = 2
	}
	else
	{
		colour = "blue"
		turn = 1
	}
}

const restart = () => {
	
}

const condition=(i,j,num)=>{
	if(array[i][j] == turn){
		num ++

		if(num == 4){
			return 100
		}
		return num
	}

	else{
		num = 0

		return num
	}
}

const checkWinner = () => {

	let num = 0		//number of consecutive checkers
	let check_condition

	for(let i=5; i>0; i--) //check horizontal
	{
		num = 0
		for(let j=0; j<6; j++){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}
		}
	}

	//------------------------------------------------------------------------------------

	for(let j=0; j<=6; j++) //check verticle
	{
		num = 0
		for(let i=5; i>=0; i--){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}
		}
	}

	//--------------------------------------------------------------------------------------

	let i = 0
	let j = 0
	let k = 0

	for(k = 0; k <= 5; k++){		//Check diagonal from (5,0) to the top 
		i = k
		j = 0
		num = 0
		while(i >= 0){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}
			i = i-1
			j = j+1
		}
	}

	for(k = 1; k < 5; k++){		//Check diagonal from (5,1) to the last column
		i = 5
		j = k
		num = 0
		while(i < 5){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}
			i = i-1
			j = j+1
		}
	}

//------------------------------------------------------------------------------------------

	for(k = 5; k >= 1; k--){		//Check diagonal from (5,6) to the top 
		i = k
		j = 6
		num = 0
		while(i >= 0){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}

			i = i-1
			j = j-1
		}
	}

	for(k = 5; k > 0; k--){		//Check diagonal from (5,5) to the left (first column)
		i = 5
		j = k
		num = 0
		while(i >= 0){
			check_condition=condition(i,j,num)
			if (check_condition==100){return 1}
			else{num=check_condition}
			i = i-1
			j = j-1
		}
	}

	return 0
}

const checkDraw= () => {
		let check = 0 
		for(let i = 0 ; i < 7; i++){
			if(movesLeft[i]!= -1){
				return 0
			}
		}
		return 1
}

wss.on('connection', ws => {

	console.log("connecting Player")

	ws.on('message', msg => { //recieve message on update call
		msg = JSON.parse(msg)

		if(msg.type == "name")
		{
			if(first == undefined) { //connection first player
				first = ws
				counter = 1
				ws.Playernum = counter
				ws.Playername = msg.data
				//console.log(ws.Playernum)
				console.log('First Player Connected', ws.Playername)
			}

			else {	//connecting second player
				counter = 2
				ws.Playernum = counter
				ws.Playername = msg.data
				//console.log(ws.Playernum) 
				console.log('Second Player Connected', ws.Playername)

				if(counter == 2) 
				{
					turn = 1

					wss.clients.forEach(client => { //Send begin signal to each player
						client.send(JSON.stringify({
							type: "begin",
							data: counter,
						}))
					})
				}
			}
		}

		if(counter == 2) {
			if(msg.type == "pos") { //Update position
				if(ws.Playernum == turn) //Check to see if right player is taking turn 
				{
					//console.log(msg.data)
					msg.data[0] = movesLeft[msg.data[1]]	//gets last available row for that coloumn
					//console.log(movesLeft[msg.data[1]])
					let r = msg.data[0]		// sets available row from the bottom
					let c = msg.data[1]		// sets provided column
						// console.log(msg.data)
					array[r][c] = ws.Playernum // changes 0s in array grid to player number to track checkers placed

					wss.clients.forEach(client => { //Send update signal to update circle colour
						client.send(JSON.stringify({
							type: "valid",
							data: msg.data,
							color: colour
						}))
					})


					if(checkWinner())
					{
						msg.data[0] = ws.Playernum
						msg.data[1] = ws.Playername

						wss.clients.forEach(client => { //Sends winning signal
							client.send(JSON.stringify({
								type: "WON",
								data: msg.data
							}))
						})
					}

					else
					{
						movesLeft[c] = movesLeft[c] -1 //minus the respective column to set available row	
						//console.log(movesLeft)
						if(checkDraw())
						{
							wss.clients.forEach(client => { //Sends draw signal
							client.send(JSON.stringify({
								type: "DRAW",
								data: "ITS A DRAW"
							}))
						})

						}

						changeTurn()	//Next move
					}
				}

				else //Wrong player is trying to make move
				{	
					ws.send(JSON.stringify({	//Send signal for wrong turn
						type:"invalid",
						data:"Its not your Turn"
					}))
				}
			}
		}
	})
})