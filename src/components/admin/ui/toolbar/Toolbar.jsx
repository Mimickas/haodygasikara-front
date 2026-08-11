import Button from "../../../ui/button/Button";
import InputComponent from "../../../ui/input/InputComponent";

export default function Toolbar({ toolbarConfigs, actions }){
    return <>
        <div className="flex items-center justify-between h-20">
        
            <div className="flex items-center gap-4">
                <div className="w-80">

                    <InputComponent
                        placeholder="Rechercher..."
                        value={""}
                        onChange={() => {}}
                        className="w-70"
                    />

                </div>
                <Button value="Sort" onClick={() => handleAction("export")} variant="secondary"/>
            </div>

            <div className="flex items-center gap-2">
                {toolbarConfigs.ctaAction.map((action, index) => (
                    <Button
                        key={index}
                        value={action.value}
                        variant={action.variant}
                        onClick={actions[action.name]}  
                    />
                ))}
            </div>

        </div>
    </>
}