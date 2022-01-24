'use strict'
import Phaser from './phaser.min.js'

export default class Slime extends Phaser.GameObjects.Sprite
{
	constructor(scene, x, y)
	{
		super(scene, x, y, 'slime')
	}

	changeColor()
	{
		this.tint = 0xffee0d
	}

	// ... other methods and actions
}
Phaser.GameObjects.GameObjectFactory.register(
	'slime',
	function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
		console.log(this, Phaser);
		// same logic as JavaScript example
	}
)