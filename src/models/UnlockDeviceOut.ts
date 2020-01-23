//import { Verify } from "crypto";

class UnlockDeviceOut {  
    // REQUIRED
    public deviceUid: string[];         
  
  
    public constructor(serial: string[]) {
      this.deviceUid = serial;     
      
      this.verify();
    }
  
    verify() {
      if (!this.deviceUid) { console.log('Erro: sem dispositivos para desbloquear.'); }
    }


  }
  
  export default UnlockDeviceOut;