<?php
header('Content-Type: application/json');
$db = new SQLite3(__DIR__ . '/data/planetpath.db');
$action = $_GET['action'] ?? '';

// Add vehicle
if($action=='addVehicle' && $_SERVER['REQUEST_METHOD']=='POST'){
    $type=trim($_POST['type']??'');
    $plate=trim($_POST['plate']??'');
    $lat=floatval($_POST['lat']??0);
    $lng=floatval($_POST['lng']??0);
    $errors=[];
    if(!$type) $errors[]='Vehicle type is required.';
    if(!$plate) $errors[]='License plate is required.';
    if(!preg_match('/^[\p{L}\p{N}\-\s]{3,20}$/u',$plate)) $errors[]='Invalid license plate format.';
    if(!is_numeric($lat)||!is_numeric($lng)) $errors[]='Invalid coordinates.';
    if($errors){ echo json_encode(['success'=>false,'errors'=>$errors]); exit;}
    $stmt=$db->prepare("INSERT INTO vehicles (type,plate,lat,lng) VALUES (:type,:plate,:lat,:lng)");
    $stmt->bindValue(':type',$type); 
    $stmt->bindValue(':plate',$plate);
    $stmt->bindValue(':lat',$lat); 
    $stmt->bindValue(':lng',$lng); 
    $stmt->execute();
    echo json_encode(['success'=>true,'message'=>'Vehicle added successfully.']); exit;
}

// Delete vehicle
if($action=='deleteVehicle' && $_SERVER['REQUEST_METHOD']=='POST'){
    $id=intval($_POST['id']??0);
    if(!$id){ echo json_encode(['success'=>false,'errors'=>['Invalid vehicle ID']]); exit; }
    $db->exec("DELETE FROM vehicles WHERE id=$id");
    echo json_encode(['success'=>true,'message'=>'Vehicle deleted successfully.']); exit;
}

// Default: return vehicles with simulated movement
$results=$db->query("SELECT * FROM vehicles");
$vehicles=[];
while($row=$results->fetchArray(SQLITE3_ASSOC)){
    $row['lat'] += (rand(-50,50)/10000);
    $row['lng'] += (rand(-50,50)/10000);
    $vehicles[]=$row;
}
echo json_encode($vehicles);
?>
