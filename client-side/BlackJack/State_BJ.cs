// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.46
// 

using Colyseus.Schema;

namespace Rubik.BlackJack {
	public partial class State_BJ : Schema {
		[Type(0, "number")]
		public float status = default(float);

		[Type(1, "map", typeof(MapSchema<Player_BJ>))]
		public MapSchema<Player_BJ> players = new MapSchema<Player_BJ>();

		[Type(2, "number")]
		public float timeTurn = default(float);
	}
}
