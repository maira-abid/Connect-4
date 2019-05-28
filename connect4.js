new Vue({
    template:`
      <div>
        <div v-if="print == false"> <h1 align = "center"> Waiting For Another Player To Join </h1></div>
        <div v-else>
              <h1 align="center"> CONNECT 4 </h1>
              <h2> Player Name: {{name}} </h2>

          <div v-if="start == true" class="grid">
             <div v-for="r in 6" >
               <div class ="column" v-for="c in 7" v-bind:style="{'background-color': board[r-1][c-1]}" @mouseenter="mouseEnter(r-1,c-1)" @mouseleave="mouseLeave(r-1,c-1)" v-on:click = 'Update(r-1,c-1)'></div>
              </div>
           </div>
        </div>

      </div>`,

    data: {
      board:[
         ["black","black","black","black","black","black","black"],
         ["black","black","black","black","black","black","black"],
         ["black","black","black","black","black","black","black"],
         ["black","black","black","black","black","black","black"],
         ["black","black","black","black","black","black","black"],
         ["black","black","black","black","black","black","black"]],

      color: 'black',
      ws: new WebSocket("ws://localhost:8080"),
      start: false,
      print: false,
      name: "",
    },

    methods: {
        //Sends location to place colour checker to sever
      	Update(r,c){ 
        	//this.board[r].splice(c,1,"blue")
        	//this.color = 'blue'
        	console.log(r,c)
        	this.ws.send(JSON.stringify({
          	type: "pos",
          	data: [r,c]
        	}))
      	},

        mouseEnter(r,c){
          color = "green"
          console.log(r,c);
          for(let i=5; i>=0; i--){
            if(this.board[i][c] == "black"){
              this.board[i].splice(c,1,color)
              break;
            }
          }
        },

        mouseLeave(r,c){
          color = "black"
          for(let i=5; i>=0; i--){
            if(this.board[i][c] == "green"){
            this.board[i].splice(c,1,color)
            break;
          }

          }
        }


    },
    mounted() {

    	this.ws.onopen = () => {
			this.name = prompt("Enter your name: ")
			console.log("Player Name=",this.name)
		}

    //To help prevent reload and closing
		window.addEventListener('beforeunload', (e) => {
  			// Cancel the event
  		e.preventDefault();
  			// Chrome requires returnValue to be set
  		e.returnValue = 'This game will end';
		});

		this.ws.onmessage = recSignal => {
			recSignal = recSignal.data
        	recSignal = JSON.parse(recSignal)

        	

          //Start game when 2 people join
        	if(recSignal.type == "begin"){
          		this.start = true
          		this.print = true

              console.log("Players=",recSignal.data)
        	}

        	if(recSignal.type == "valid"){
            //Changes colour of the circle if the move is valid

            console.log(recSignal.data)
          		let r = recSignal.data[0]   //row of the colour change
          		let c = recSignal.data[1]   //col of the colour change
          		this.player = recSignal.color     //colour of the current player
          		//console.log(recSignal.color)
          
          		this.board[r].splice(c,1,recSignal.color)   //Change colour
        	}
        
          //Out of turn warning
        	if (recSignal.type == "invalid"){
          		alert("Wait for Your Turn ")
        	}
      	}
    }

}).$mount(`#root`)