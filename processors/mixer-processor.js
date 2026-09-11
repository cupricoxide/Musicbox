// Mixer module.
// Sums two inputs, each with its own k-rate gain, into a single output.
// This is the generic "patch cord meeting point" -- any two audio-rate
// signals can be wired into it regardless of what produced them.
class MixerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'gain0', defaultValue: 0.7, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'gain1', defaultValue: 0.7, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    const in0 = inputs[0] && inputs[0][0];
    const in1 = inputs[1] && inputs[1][0];
    const g0 = parameters.gain0[0];
    const g1 = parameters.gain1[0];

    for (let i = 0; i < channel.length; i++) {
      const a = in0 ? in0[i] : 0;
      const b = in1 ? in1[i] : 0;
      channel[i] = Math.tanh(a * g0 + b * g1);
    }

    for (let ch = 1; ch < output.length; ch++) output[ch].set(channel);
    return true;
  }
}

registerProcessor('mixer-processor', MixerProcessor);
