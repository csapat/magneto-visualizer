var THREE = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
const Vector3 = THREE.Vector3

// Init scene & camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000000)




const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const sphereRadius = 6371


// GuideLine
const lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff})
const guideLineGeometry = new THREE.Geometry()
guideLineGeometry.vertices.push(new Vector3(0, 0, 0))
guideLineGeometry.vertices.push(new Vector3(10000, 13000, 0))
const guideLine = new THREE.Line(guideLineGeometry, lineMaterial)
//scene.add(guideLine)

// Grid
const gridSize = 20000
const gridStep = 2000
const gridHelperHorizontal = new THREE.GridHelper(gridSize, gridSize/gridStep)
const gridHelperVertical = new THREE.GridHelper(gridSize, gridSize/gridStep)
gridHelperVertical.geometry.rotateX(Math.PI/2)
//scene.add(gridHelperHorizontal)
//scene.add(gridHelperVertical)


// Light
const light = new THREE.AmbientLight(0xE5E5E5);
scene.add(light);

// Sphere

sphereMaterial = new THREE.MeshPhongMaterial({
	map: new THREE.TextureLoader().load('src/earth.jpg'),
}) 
sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 32, 32), sphereMaterial)
sphere.position.set(0, 0, 0)
scene.add(sphere)

//

// BP 47.4979° N, 19.0402° E
function toRadians (angle) {
	return angle * (Math.PI / 180);
}

function getCoordinates(lat, lon, alt){
	let r = sphereRadius + alt
	x = r*Math.cos(toRadians(lat))*Math.cos(toRadians(lon))
	z = r*Math.cos(toRadians(lat))*Math.sin(toRadians(lon))
	y = r*Math.sin(toRadians(lat))
	return {x,y,z}
}

function createLineFromGeo(lat, lon, alt=3000){
	let {x,y,z} = getCoordinates(lat, lon, alt)
	createLine(x,y,z)
}

function createLine(xOrVector3, y, z){
	//console.log(xOrVector3)
	const lineGeometry = new THREE.Geometry()
	lineGeometry.vertices.push(new Vector3(0, 0, 0))
	if (typeof xOrVector3 == 'number') lineGeometry.vertices.push(new Vector3(x, y, z))
	else lineGeometry.vertices.push(xOrVector3)
	const line = new THREE.Line(lineGeometry, lineMaterial)
	line.name="line"
	scene.add(line)
}

//createLine(51.4934, 0) // Greenwich

//createLineFromGeo(47.4979, -19.0402) // Bp





// Vectors
/*
const data = `990	31	41	15
900	31	41	15
800	31	41	15
700	31	41	15
600	31	41	15
500	31	41	15
`
data.split('\n').map(r=>{
	if (!r.length) return
	let row = r.split('\t')
	let h = row[0]
	let x = row[1]
	let y = row[2]
	let z = row[3]
	let vectorDir = new Vector3(100, 0, 0).normalize()
	let vectorOrigin = new Vector3(0, sphereRadius+(h/100), 0)
	let vectorLength = 1

	const vectorArrowHelper = new THREE.ArrowHelper(vectorDir, vectorOrigin, vectorLength, 0xffff00)
	scene.add(vectorArrowHelper)
})
*/
// Controls
var controls = new OrbitControls(camera, renderer.domElement)
const origo = new Vector3(0,0,0)
//controls.addEventListener( 'change', animate )
camera.position.set(100, 15000, 15000)
let i = 0
const animate = ()=>{
	requestAnimationFrame(animate)
	controls.update()
	scene.remove(scene.getObjectByName('grid'))
	scene.remove(scene.getObjectByName('arrow'))
	scene.remove(scene.getObjectByName('line'))
	i = (i+0.6)
	const magnetoData = [{
		lat: 90, lon: 0, height: 2000,
		x: 1000, y: 1000, z: 0
	}]
	magnetoData.map(row=>{
		createLineFromGeo(row.lat, row.lon, row.height)
		
		let originCoordinates = getCoordinates(row.lat, row.lon, row.height)
		let originVector = new Vector3(originCoordinates.x, originCoordinates.y, originCoordinates.z)
		let dataVector = new Vector3(row.x, row.y, row.z)
		//camera.lookAt(originVector)
		let vectorDir = (dataVector.clone()).normalize()
		//console.log(originCoordinates)
		//createLine(originVector)
		//createLine(originVector.clone().add(dataVector))

		let vectorLength = new Vector3(row.x, row.y, row.z).length()
		//scene.add(new THREE.ArrowHelper(dataVector, origo, 5000, 0xffff00))
		const vectorArrowHelper = new THREE.ArrowHelper(vectorDir, originVector, 2000, 0xffff00)
		vectorArrowHelper.rotation.set(vectorArrowHelper.rotation.x, toRadians(-1*row.lon), toRadians(90-(-1*row.lat)))
		//vectorArrowHelper.rotation.set(vectorArrowHelper.rotation.x, vectorArrowHelper.rotation.y+toRadians(-1*row.lon), vectorArrowHelper.rotation.z+toRadians(90-(-1*row.lat)))
		//vectorArrowHelper.rotateY(toRadians(-1*row.lon))
		//vectorArrowHelper.rotateZ(toRadians(90-(-1*row.lat)))
		vectorArrowHelper.name = 'arrow'
		scene.add(vectorArrowHelper)
	
		const gridHelperVector = new THREE.GridHelper(gridSize, gridSize/gridStep)
	
		gridHelperVector.position.set(originCoordinates.x, originCoordinates.y, originCoordinates.z)
		gridHelperVector.rotation.set(0, toRadians(-1*row.lon), toRadians(90-(-1*row.lat)))
	
		gridHelperVector.name = "grid"
		scene.add(gridHelperVector)
	})
	renderer.render(scene, camera)
}
animate()