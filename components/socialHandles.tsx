import {SocialIcon} from "react-social-icons";


const SocialHandles = ({ icon, handle }) => {
    return (
      <div className="flex justify-start sm:justify-center items-center gap-1 grid sm:flex">
        <SocialIcon
          network={icon?.toLowerCase()}
          className="text-white bg-white w-2 h-2 sm:w-2 sm:h-2"
        />
        <p className="text-gray-600  md:text-[0.9rem] sm:text-base">{handle}</p>
      </div>
    );
  };
  
  export default SocialHandles;
  