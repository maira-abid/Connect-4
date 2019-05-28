const webSocket = require('ws')

const wss = new  webSocket.Server({port:8080})
console.log("webSocket Server Started...")

let first
let counter = 0
let colour = "blue"
let turn = 0
let maintainrow = [ 5 , 5 , 5 , 5 , 5 , 5 , 5 ]

let array =      [[ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],	
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
				  ]

const changeTurn = () => {
	if(turn == 1 )
	{
		colour = " red " 
		turn =2
	}
	else
	{
		colour = "blue"
		turn = 1
	}
}

wss.on('connection', ws => {

	if(first == undefined) {
		first = ws
		counter = 1
		ws.Playernum = counter
		//console.log(ws.Playernum)
		console.log('First Player Connected')
	}
	else {
		counter = 2
		ws.Playernum = counter
		//console.log(ws.Playernum) 
		console.log('Second Player Connected')

		if(counter == 2) 
		{
			turn = 1

			wss.clients.forEach(client => {
				client.send(JSON.stringify({
					type: "begin",
					data: counter,
				}))
			})
		}
	}

	ws.on('message', msg => {
		msg = JSON.parse(msg)
		if(counter == 2) {
			if(msg.type == "pos") {
				if(ws.Playernum == turn) 
				{
					msg.data[0] = maintainrow[msg.data[1]]
					let r = msg.data[0]
					let c = msg.data[1]
						// console.log(msg.data)
					array[r][c] = ws.Playernum

					wss.clients.forEach(client => {
						client.send(JSON.stringify({
						type: "valid",
						data: msg.data,
						color: colour
						}))
					})

					maintainrow[c] = maintainrow[c] -1	

					changeTurn()
				}

				else
				{	
					ws.send(JSON.stringify({
						type:"invalid",
						data:"Its not your Turn"
					}))
				}
			}
		}
	})
})