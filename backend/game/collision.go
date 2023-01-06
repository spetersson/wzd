package game

import (
	"math"

	"github.com/spetersson/wzd/backend/vec"
)

type BB struct {
	Left   float64
	Right  float64
	Top    float64
	Bottom float64
}

func sign(num float64) float64 {
	if num > 0 {
		return 1
	} else {
		return -1
	}
}

func collidePlayerBB(player *Player, bb BB) {
	halfW := (bb.Right - bb.Left) * 0.5
	halfH := (bb.Bottom - bb.Top) * 0.5
	bbMid := vec.NewVec(bb.Left+halfW, bb.Top+halfH)
	delta := player.Pos.Sub(bbMid)
	// Line to collide with
	var linePos vec.Vec
	var lineNorm vec.Vec

	if math.Abs(delta.X) >= halfW && math.Abs(delta.Y) > halfH {
		// Corner collision
		linePos = vec.NewVec(
			bbMid.X+sign(delta.X)*halfW,
			bbMid.Y+sign(delta.Y)*halfH,
		)
		lineNorm = player.Pos.Sub(linePos)
		lineNorm.INormalize()
	} else if math.Abs(delta.X) > math.Abs(delta.Y) {
		// Horizontal
		linePos = vec.NewVec(bbMid.X+halfW*sign(delta.X), bbMid.Y)
		lineNorm = vec.NewVec(sign(delta.X), 0)
	} else {
		// Vertical
		lineNorm = vec.NewVec(0, sign(delta.Y))
		linePos = vec.NewVec(bbMid.X, bbMid.Y+halfH*sign(delta.Y))
	}

	// Project player onto line normal
	relPos := player.Pos.Sub(linePos)
	scalar := relPos.Dot(lineNorm)
	// scalar is the distance from the block to the player

	// Check if player is inside block
	if scalar < PLAYER_RAD {
		// Distance needed to move out of the block
		dist := PLAYER_RAD - scalar
		player.Pos.IAdd(lineNorm.Mul(dist))
	}
}

func (game *Game) collidePlayerPlayer(pA, pB *Player) {
	delta := pB.Pos.Sub(pA.Pos)
	overlap := 2*PLAYER_RAD - delta.Mag()

	// Check if they are colliding
	if overlap < 0 {
		return
	}

	// Calculate how much to move each player, the one with higher speed moves more
	velA := pA.Vel.Mag()
	velB := pB.Vel.Mag()
	var weightA float64
	var weightB float64
	if velA == 0 && velB == 0 {
		weightA = 0.5
		weightB = 0.5
	} else {
		velTotInv := 1 / (velA + velB)
		weightA = velA * velTotInv
		weightB = velB * velTotInv
	}

	// Move players
	if delta.IsZero() {
		// In case players are exactly on top of each other
		pA.Pos.Y -= PLAYER_RAD * 0.5
		pB.Pos.Y += PLAYER_RAD * 0.5
	} else {
		deltaNorm := delta.Normalized()
		pA.Pos.IAdd(deltaNorm.Mul(-overlap * weightA))
		pB.Pos.IAdd(deltaNorm.Mul(overlap * weightB))
	}
}
