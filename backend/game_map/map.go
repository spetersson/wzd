package game_map

import (
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
)

var (
	TILE_WATER      = color.NRGBA{0, 0, 0, 255}
	TILE_LAND       = color.NRGBA{255, 255, 255, 255}
	TILE_ENEMY_BASE = color.NRGBA{255, 0, 0, 255}
)

type EnemyBase struct {
	x int
	y int
}

func (eb *EnemyBase) Pos() (x int, y int) {
	return eb.x, eb.y
}

type GameMap struct {
	width      int
	height     int
	tiles      [][]Tile
	enemyBases []EnemyBase
}

type Tile struct {
	Walkable   bool
	BuildingId int
}

func (gm *GameMap) Width(x, y int) int {
	return gm.width
}

func (gm *GameMap) Height(x, y int) int {
	return gm.height
}

func (gm *GameMap) NumEnemyBases() int {
	return len(gm.enemyBases)
}

func (gm *GameMap) EnemyBase(i int) EnemyBase {
	return gm.enemyBases[i]
}

func (gm *GameMap) At(x, y int) *Tile {
	return &gm.tiles[y][x]
}

func (gm *GameMap) IsInside(x, y int) bool {
	return x >= 0 && x < gm.width && y >= 0 && y < gm.height
}

func GetMap() GameMap {
	filename := "game_map/world.map.png"
	file, err := os.Open(filename)
	if err != nil {
		log.Fatalf("File %s does not exist", filename)
	}
	defer file.Close()

	img, err := png.Decode(file)
	if err != nil {
		log.Fatalf("Could not decode image %s", filename)
	}

	if img.Bounds().Min != (image.Point{0, 0}) {
		log.Fatal("Min values are not (0,0)")
	}

	width := img.Bounds().Max.X
	height := img.Bounds().Max.Y
	tiles := make([][]Tile, height)
	enemyBases := make([]EnemyBase, 0)
	for y := 0; y < height; y++ {
		tiles[y] = make([]Tile, width)
		for x := 0; x < width; x++ {
			col, ok := img.At(x, y).(color.NRGBA)
			if !ok {
				log.Fatalf("Pixel at (%d, %d) could not be converted to RGBA", x, y)
			}
			switch col {
			case TILE_WATER:
				tiles[y][x] = Tile{false, 0}
			case TILE_ENEMY_BASE:
				enemyBases = append(enemyBases, EnemyBase{x, y})
				tiles[y][x] = Tile{true, 0}
			case TILE_LAND:
				tiles[y][x] = Tile{true, 0}
			default:
				log.Fatal("Unknown tile color %w", col)
			}
		}
	}

	return GameMap{
		width,
		height,
		tiles,
		enemyBases,
	}
}
