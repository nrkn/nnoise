'use strict'

const { Grid } = require( 'ngeom' )
const SimplexNoise = require( 'simplex-noise' )

const simplex = new SimplexNoise( Math.random )

const project = a => {
  return {
    x: Math.sin( a * Math.PI * 2 ),
    y: Math.cos( a * Math.PI * 2 )
  }
}

const normalize = values => {
  let min = 1
  let max = -1
  
  values.forEach( 
    v => {
      min = v < min ? v : min
      max = v > max ? v : max
    }
  )
  
  const delta = max - min
  
  return values.map( v => ( v - min ) / delta )
}

const noisePoints = ( grid, zoom ) =>
  grid.points().map(
    point => {
      const a = project( point.x / grid.size.width )
      const b = project( point.y / grid.size.height )
      
      return simplex.noise4D( a.x  * zoom, a.y  * zoom, b.x * zoom, b.y * zoom )
    }
  )

const add = ( arr1, arr2 ) => 
  arr1.map( ( v, i ) => v + arr2[ i ] )

const octaves = ( grid, start, count ) => {
  let result = noisePoints( grid, start )
  
  for( let i = 1; i < count; i++ ){
    start /= 2
    result = add( result, noisePoints( grid, start ) )
  }
  
  return normalize( result )
}
 
module.exports = ( size, start, count ) => {   
  const noise = Grid( size )
  
  const values = octaves( noise, start, count )

  noise.points().forEach( ( point, i ) => {
    noise.at( point, values[ i ] )
  })
  
  return noise
}
