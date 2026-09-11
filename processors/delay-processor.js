// Feedback delay module.
// Takes an input signal and returns a delayed, feedback-processed version.
// delayTime and feedback are k-rate: read once per 128-sample block.
// The feedback loop is only computable because the read position always
// lags the write position by at least one sample -- the delay line itself
// supplies the "delay-free-loop" compensation Pd inserts automatically.
class DelayProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'delayTime', defaultValue: 0.25, minValue: 0.001, maxValue: 2, automationRate: 'k-rate' },
      { name: 'feedback', defaultValue: 0.3, minValue: 0, maxValue: 0.95, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this.maxDelaySeconds = 2.0;
    this.bufferSize = Math.ceil(sampleRate * this.maxDelaySeconds);
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    const input = (inputs[0] && inputs[0][0]) || null;

    const delaySec = parameters.delayTime[0];
    const feedback = parameters.feedback[0];
    const delaySamples = Math.min(
      Math.max(Math.round(delaySec * sampleRate), 1),
      this.bufferSize - 1
    );

    for (let i = 0; i < channel.length; i++) {
      const x = input ? input[i] : 0;
      const readIndex = (this.writeIndex - delaySamples + this.bufferSize) % this.bufferSize;
      const delayed = this.buffer[readIndex];

      let y = x + delayed * feedback;
      y = Math.tanh(y); // soft clip -- keeps the feedback loop bounded

      this.buffer[this.writeIndex] = y;
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;

      channel[i] = y;
    }

    for (let ch = 1; ch < output.length; ch++) output[ch].set(channel);
    return true;
  }
}

registerProcessor('delay-processor', DelayProcessor);
