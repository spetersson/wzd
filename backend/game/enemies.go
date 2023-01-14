package game

import (
	"log"
	"math"
	"math/rand"

	"github.com/spetersson/wzd/backend/game_map"
	m "github.com/spetersson/wzd/backend/math"
	phy "github.com/spetersson/wzd/backend/physics"
)

type Enemy struct {
	Id   int
	body phy.BodyCircle
}

func (game *Game) spawnEnemies(dt float64) {
	numEnemies := len(game.enemies)
	if numEnemies >= MAX_ENEMIES {
		return
	}

	whole, frac := math.Modf(dt * ENEMY_SPAWN_RATE)

	newEnemies := int(whole)
	if rand.Float64() < frac {
		newEnemies++
	}

	if numEnemies+newEnemies > MAX_ENEMIES {
		newEnemies = MAX_ENEMIES - numEnemies
	}

	if newEnemies <= 0 {
		return
	}

	enemyBases := make([]*game_map.Building, 0)
	for _, building := range game.gameMap.Buildings() {
		if building.TypeId() == game_map.BUILDING_TYPE_ENEMY_BASE {
			enemyBases = append(enemyBases, building)
		}
	}

	if len(enemyBases) == 0 {
		return
	}

	for i := 0; i < newEnemies; i++ {
		bi := rand.Intn(len(enemyBases))
		base := enemyBases[bi]
		// Find a tile outside base
		ix, iy := base.XY()
		if rand.Intn(2) == 0 {
			ix += rand.Intn(2)*2 - 1
			iy += rand.Intn(3) - 1
		} else {
			ix += rand.Intn(3) - 1
			iy += rand.Intn(2)*2 - 1
		}
		enemy := &Enemy{
			Id: game.nextId(),
			body: phy.NewBodyCircle(
				m.NewCircle(
					m.NewVec(float64(ix)+0.5, float64(iy)+0.5),
					PLAYER_RAD,
				),
				m.NewVec(0, 0),
			),
		}
		game.enemies[enemy.Id] = enemy
		log.Print("Enemy spawned")
	}
}
