// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.46
// 

using Colyseus.Schema;

namespace Rubik._21J {
	public partial class State_21J : Schema {
		[Type(0, "number")]
		public float status = default(float);

		[Type(1, "map", typeof(MapSchema<Player_21J>))]
		public MapSchema<Player_21J> players = new MapSchema<Player_21J>();

		[Type(2, "number")]
		public float timeTurn = default(float);
	}
}
