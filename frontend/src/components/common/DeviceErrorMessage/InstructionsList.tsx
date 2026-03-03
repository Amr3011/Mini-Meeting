interface InstructionsListProps {
  instructions: string[];
}

export const InstructionsList: React.FC<InstructionsListProps> = ({
  instructions,
}) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <p className="text-sm font-medium text-gray-700 mb-2">How to fix this:</p>
    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
      {instructions.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
    </ol>
  </div>
);
