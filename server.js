const webSocket = require('ws')

const wss = new  webSocket.Server({port:8080})
console.log("webSocket Server Started...")

let first //first player
let counter = 0
let colour = "blue" //colour for first player
let turn = 0
let maintainrow = [ 5 , 5 , 5 , 5 , 5 , 5 , 5 ] //To check position to place checker from the last row

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

const checkWinner = () => {

	for(let i=5; i>0; i--) //check horizontal
	{
		let num = 0
		for(let j=0; j<6; j++)
		{
			if(array[i][j] == turn)
			{
				num ++

				if(num == 4)
				{
					return 1
				}
			}

			else
			{
				num = 0
			}

		}
	}

	for(let i=0; i<6; i++) //check verticle
	{
		let num = 0
		for(let j=5; j>0; j--)
		{
			if(array[j][i] == turn)
			{
				num ++;

				if(num == 4)
				{
					return 1
				}
			}
				
			else
			{
				num = 0;
			}

		}
	}

	return 0
}

wss.on('connection', ws => {

	if(first == undefined) { //connection first player
		first = ws
		counter = 1
		ws.Playernum = counter
		//console.log(ws.Playernum)
		console.log('First Player Connected')
	}
	else {	//connecting second player
		counter = 2
		ws.Playernum = counter
		//console.log(ws.Playernum) 
		console.log('Second Player Connected')

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

	ws.on('message', msg => { //recieve message on update call
		msg = JSON.parse(msg)
		if(counter == 2) {
			if(msg.type == "pos") { //Update position
				if(ws.Playernum == turn) //Check to see if right player is taking turn 
				{
					//console.log(msg.data)
					msg.data[0] = maintainrow[msg.data[1]]	//gets last available row for that coloumn
					//console.log(maintainrow[msg.data[1]])
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
						wss.clients.forEach(client => { //Sends winning signal
							client.send(JSON.stringify({
								type: "WON",
								data: ws.Playernum
							}))
						})
					}

					else
					{
						maintainrow[c] = maintainrow[c] -1 //minus the respective column to set available row	
						//console.log(maintainrow)
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