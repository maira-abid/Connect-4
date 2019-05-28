new Vue({
    template:`
      <div>
        <div v-if="print == false"> <h1 align = "center"> Waiting For Another Player To Join </h1></div>
        <div v-else>
              <h1 align="center"> CONNECT 4 </h1>
              <h2> Player Name: {{name}} </h2>

          <div v-if="start == true" class="grid">
             <div v-for="r in 6" >
               <div class ="column" v-for="c in 7" v-bind:style="{'background-color': move[r-1][c-1]}" v-on:click = 'Update(r-1,c-1)'></div>
              </div>
           </div>
        </div>

      </div>`,

    data: {
      move:[
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
      	Update(r,c){
        	//this.move[r].splice(c,1,"blue")
        	//this.color = 'blue'
        	console.log(r,c)
        	this.ws.send(JSON.stringify({
          	type: "pos",
          	data: [r,c]
        	}))
      	},
    },
    mounted() {

    	this.ws.onopen = () => {
			this.name = prompt("Enter your name: ")
			console.log(this.name)
		}

		window.addEventListener('beforeunload', (e) => {
  			// Cancel the event
  			e.preventDefault();
  			// Chrome requires returnValue to be set
  			e.returnValue = 'This game will end';

		});

		this.ws.onmessage = recSignal => {
			recSignal = recSignal.data
        	recSignal = JSON.parse(recSignal)

        	console.log(recSignal.data)

        	if(recSignal.type == "begin"){
          		this.start = true
          		this.print = true
        	}

        	if(recSignal.type == "valid"){
          		let r = recSignal.data[0]
          		let c = recSignal.data[1]
          		this.player = recSignal.color
          		//console.log(recSignal.color)
          
          		this.move[r].splice(c,1,recSignal.color)
        	}
        
        	if (recSignal.type == "invalid"){
          		alert("Wait for Your Turn ")
        	}
      	}
    }

}).$mount(`#root`)