package game

import (
	"log"

	m "github.com/spetersson/wzd/backend/math"
	phy "github.com/spetersson/wzd/backend/physics"
)

func (game *Game) collidePlayerPlayer(a, b phy.Body) {

	// Check if they are colliding
	collision := a.Collide(b)
	if collision == nil {
		return
	}

	// Calculate how much to move each player, the one with higher speed moves more
	velA := a.Vel().Mag()
	velB := b.Vel().Mag()
	weightA := 0.5
	weightB := 0.5
	if velA > 0 || velB > 0 {
		velTotInv := 1 / (velA + velB)
		weightA = velA * velTotInv
		weightB = velB * velTotInv
	}

	// Move players
	a.GetPos().Add(collision.Norm.Mul(collision.Overlap * weightA))
	b.GetPos().Add(collision.Norm.Mul(-collision.Overlap * weightB))
}

func (game *Game) collideBodyTiles(body phy.Body) {

	// Get index range of body bounding box
	minIX, maxIX, minIY, maxIY := body.GetBB().GetIdx()

	// Check all blocks in index range
	bodyBB := phy.NewBodyBB(m.BB{}, m.Vec{})
	for ix := minIX; ix <= maxIX; ix++ {
		for iy := minIY; iy <= maxIY; iy++ {
			// Check if block is land
			if !game.gameMap.IsInside(ix, iy) {
				continue
			}

			tile := game.gameMap.At(ix, iy)
			if !tile.Walkable() {
				// Collide with entire tile
				bodyBB.SetBB(m.BB{
					Left:   float64(ix),
					Right:  float64(ix + 1),
					Top:    float64(iy),
					Bottom: float64(iy + 1),
				})
			} else if tile.Building() != nil {
				// Collide with building on tile
				diff := (1 - tile.Building().Type().Size()) * 0.5
				bodyBB.SetBB(m.BB{
					Left:   float64(ix) + diff,
					Right:  float64(ix) + 1 - diff,
					Top:    float64(iy) + diff,
					Bottom: float64(iy) + 1 - diff,
				})
			} else {
				continue
			}

			collision := body.Collide(&bodyBB)
			if collision != nil {
				log.Print("Collide!")
				body.GetPos().Add(collision.Norm.Mul(collision.Overlap))
			}
		}
	}

}
