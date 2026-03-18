import * as mediasoupClient from "mediasoup-client";

class DeviceManager {
  private device: mediasoupClient.Device | null = null;
  private isLoaded = false;

  // Load the mediasoup device with router RTP capabilities
  async loadDevice(routerRtpCapabilities: any) {
    if (this.device && this.isLoaded) {
      console.log("Device already loaded");
      return this.device;
    }

    try {
      this.device = new mediasoupClient.Device();

      await this.device.load({
        routerRtpCapabilities,
      });

      this.isLoaded = true;

      console.log("Device loaded successfully");

      return this.device;
    } catch (error) {
      console.error("Error loading device:", error);
      throw error;
    }
  }

  // Get the loaded device
  getDevice() {
    if (!this.device || !this.isLoaded) {
      throw new Error("Device not loaded yet");
    }

    return this.device;
  }

  //Check if device is ready
  isDeviceLoaded() {
    return this.isLoaded;
  }
}

export const deviceManager = new DeviceManager();
