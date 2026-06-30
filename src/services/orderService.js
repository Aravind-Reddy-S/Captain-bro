import { 
  createOrderDb, 
  getOrdersDb, 
  updateOrderStatusDb,
  updateOrderFieldsDb,
  subscribeToOrdersDb,
  getMedicineOrdersDb,
  subscribeToMedicineOrdersDb,
  updateMedicineOrderStatusDb,
  updateMedicineOrderFieldsDb
} from '../firebase/database';

export const createOrder = async (orderData) => {
  return await createOrderDb(orderData);
};

export const getOrders = async () => {
  const foodOrders = await getOrdersDb();
  try {
    const medOrders = await getMedicineOrdersDb();
    const normalizedMedOrders = medOrders.map(mo => ({
      ...mo,
      isMedicineOrder: true,
      customerName: mo.patientName,
      customerPhone: mo.phone,
      address: mo.address || 'Current Location, Warangal',
      total: mo.total || 0,
      items: mo.medicineList ? mo.medicineList.split(',').map((name, i) => ({ id: i, name: name.trim(), quantity: 1 })) : []
    }));
    return [...foodOrders, ...normalizedMedOrders];
  } catch (err) {
    console.error("Error merging medicine orders in getOrders:", err);
    return foodOrders;
  }
};

export const updateOrderStatus = async (id, status, riderId = null) => {
  if (id.startsWith('med_')) {
    return await updateMedicineOrderStatusDb(id, status, riderId);
  }
  return await updateOrderStatusDb(id, status, riderId);
};

export const updateOrderFields = async (id, fields) => {
  if (id.startsWith('med_')) {
    return await updateMedicineOrderFieldsDb(id, fields);
  }
  return await updateOrderFieldsDb(id, fields);
};

export const subscribeToOrders = (callback) => {
  let foodOrdersList = [];
  let medOrdersList = [];

  const updateAndCombine = () => {
    const normalizedMedOrders = medOrdersList.map(mo => ({
      ...mo,
      isMedicineOrder: true,
      customerName: mo.patientName,
      customerPhone: mo.phone,
      address: mo.address || 'Current Location, Warangal',
      total: mo.total || 0,
      items: mo.medicineList ? mo.medicineList.split(',').map((name, i) => ({ id: i, name: name.trim(), quantity: 1 })) : []
    }));
    callback([...foodOrdersList, ...normalizedMedOrders]);
  };

  const unsubFood = subscribeToOrdersDb((data) => {
    foodOrdersList = data;
    updateAndCombine();
  });

  const unsubMed = subscribeToMedicineOrdersDb((data) => {
    medOrdersList = data;
    updateAndCombine();
  });

  return () => {
    unsubFood();
    unsubMed();
  };
};
