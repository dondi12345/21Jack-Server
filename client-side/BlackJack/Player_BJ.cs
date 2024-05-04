// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.46
// 

using Colyseus.Schema;

namespace Rubik.BlackJack {
	public partial class Player_BJ : Schema {
		[Type(0, "string")]
		public string SessionId = default(string);

		[Type(1, "number")]
		public float status = default(float);

		[Type(2, "number")]
		public float gold = default(float);
	}
}
