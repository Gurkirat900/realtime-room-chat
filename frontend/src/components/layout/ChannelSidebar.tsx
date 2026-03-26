export default function ChannelSidebar() {
  const textChannels = ["general", "memes"]
  const voiceChannels = ["General VC", "Coding VC"]

  return (
    <div className="w-64 bg-gray-850 p-4 text-gray-300">
      <h2 className="text-sm font-semibold mb-2">TEXT CHANNELS</h2>
      <ul className="mb-4">
        {textChannels.map(ch => (
          <li key={ch} className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            # {ch}
          </li>
        ))}
      </ul>

      <h2 className="text-sm font-semibold mb-2">VOICE CHANNELS</h2>
      <ul>
        {voiceChannels.map(vc => (
          <li key={vc} className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            🔊 {vc}
          </li>
        ))}
      </ul>
    </div>
  )
}