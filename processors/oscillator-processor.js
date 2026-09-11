// Oscillator module.
// frequency and gain are a-rate: the browser interpolates them every sample,
// so parameter changes glide smoothly rather than stepping between blocks.
class OscillatorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 220, minValue: 20, maxValue: 4000, automationRate: 'a-rate' },
      { name: 'gain', defaultValue: 0.2, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
    ];
  }

  constructor() {
    super();
    this.phase = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    const freqParam = parameters.frequency;
    const gainParam = parameters.gain;

    for (let i = 0; i < channel.length; i++) {
      const freq = freqParam.length > 1 ? freqParam[i] : freqParam[0];
      const gain = gainParam.length > 1 ? gainParam[i] : gainParam[0];

      this.phase += freq / sampleRate;
      if (this.phase >= 1) this.phase -= 1;

      channel[i] = Math.sin(2 * Math.PI * this.phase) * gain;
    }

    for (let ch = 1; ch < output.length; ch++) output[ch].set(channel);
    return true;
  }
}

registerProcessor('oscillator-processor', OscillatorProcessor);
