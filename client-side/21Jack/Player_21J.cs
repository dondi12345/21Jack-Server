// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.46
// 

using Colyseus.Schema;

namespace Rubik._21J {
	public partial class Player_21J : Schema {
		[Type(0, "string")]
		public string SessionId = default(string);

		[Type(1, "number")]
		public float score = default(float);

		[Type(2, "number")]
		public float health = default(float);
	}
}
