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

type GameMap struct {
	width     int
	height    int
	tiles     [][]Tile
	buildings map[int]*Building
	counter   int
}

func (gm *GameMap) Width() int {
	return gm.width
}

func (gm *GameMap) Height() int {
	return gm.height
}

func (gm *GameMap) At(x, y int) *Tile {
	return &gm.tiles[y][x]
}

func (gm *GameMap) IsInside(x, y int) bool {
	return x >= 0 && x < gm.width && y >= 0 && y < gm.height
}

func (gm *GameMap) Buildings() map[int]*Building {
	return gm.buildings
}

func (gm *GameMap) Place(typeId, x, y int) *Building {
	id := gm.counter
	gm.counter++
	building := Building{
		id:     id,
		typeId: typeId,
		ix:     x,
		iy:     y,
	}

	gm.tiles[y][x].building = &building
	gm.buildings[id] = &building

	return &building
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
	buildings := make(map[int]*Building)
	for y := 0; y < height; y++ {
		tiles[y] = make([]Tile, width)
		for x := 0; x < width; x++ {
			col, ok := img.At(x, y).(color.NRGBA)
			if !ok {
				log.Fatalf("Pixel at (%d, %d) could not be converted to RGBA", x, y)
			}
			switch col {
			case TILE_WATER:
				tiles[y][x] = Tile{false, nil}
			case TILE_ENEMY_BASE:
				tiles[y][x] = Tile{true, nil}
			case TILE_LAND:
				tiles[y][x] = Tile{true, nil}
			default:
				log.Fatal("Unknown tile color %w", col)
			}
		}
	}

	return GameMap{
		width:     width,
		height:    height,
		tiles:     tiles,
		buildings: buildings,
		counter:   0,
	}
}
