package game_map

import (
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
)

type RGBA = color.RGBA

var (
	TILE_WATER      = RGBA{0, 0, 0, 255}
	TILE_ROCK       = RGBA{128, 128, 128, 255}
	TILE_LAND       = RGBA{255, 255, 255, 255}
	TILE_ENEMY_BASE = RGBA{255, 0, 0, 255}
)

type GameMap struct {
	width     int
	height    int
	tiles     [][]Tile
	buildings map[int]*Building
	idCounter int
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
	building := Building{
		id:     gm.nextId(),
		typeId: typeId,
		ix:     x,
		iy:     y,
	}

	gm.tiles[y][x].building = &building
	gm.buildings[building.id] = &building

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
	gm := GameMap{
		width:     width,
		height:    height,
		tiles:     make([][]Tile, height),
		buildings: make(map[int]*Building),
		idCounter: 0,
	}
	for iy := 0; iy < height; iy++ {
		gm.tiles[iy] = make([]Tile, width)
		for ix := 0; ix < width; ix++ {
			col, ok := img.At(ix, iy).(RGBA)
			if !ok {
				colNRGBA, ok := img.At(ix, iy).(color.NRGBA)
				if !ok {
					log.Fatalf("Pixel at (%d, %d) could not be converted to RGBA", ix, iy)
				}
				col = RGBA(colNRGBA)
			}
			switch col {
			case TILE_WATER:
				gm.tiles[iy][ix] = Tile{false, nil}
			case TILE_ENEMY_BASE:
				id := gm.nextId()
				building := &Building{
					id:     id,
					typeId: BUILDING_TYPE_ENEMY_BASE,
					ix:     ix,
					iy:     iy,
				}
				gm.tiles[iy][ix] = Tile{true, building}
				gm.buildings[id] = building
			case TILE_LAND:
				gm.tiles[iy][ix] = Tile{true, nil}
			case TILE_ROCK:
				gm.tiles[iy][ix] = Tile{true, nil}
			default:
				log.Fatal("Unknown tile color %w", col)
			}
		}
	}

	return gm
}

func (gm *GameMap) nextId() int {
	id := gm.idCounter
	gm.idCounter++
	return id
}
