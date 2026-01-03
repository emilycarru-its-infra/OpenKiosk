/**
 * ON SCREEN KEYBOARD
 */

@font-face 
{
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(chrome://openkiosk/skin/icons.woff2) format('woff2');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  padding-top: 10px;
  word-wrap: normal;
  direction: ltr;
  -moz-font-feature-settings: 'liga';
  -moz-osx-font-smoothing: grayscale;
}

#ok-osk-main
{
}

.keyboard
{
    width: 100%;
    padding: 5px 0;
    background: #3274ed;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    user-select: none;
    transition: bottom 0.4s;
    position: sticky;
    left: 0;
    bottom: 0;
}

.keyboard-hidden { display: none; }

.keyboard_keys 
{ 
  text-align: center; 
}

.keyboard_top 
{
}

.keyboard_bottom
{
  z-index: 9;
}

.keyboard_key 
{
    height: 45px;
    width: 6%;
    max-width: 90px;
    margin: 3px;
    border-radius: 4px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font: message-box;
    font-style: normal;
    font-weight: 400;
    font-weight: bold;
    font-size: 1.05rem;
    outline: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    line-height: 45px;
    padding: 0;
    position: relative;
    display: inline-block;
}

.keyboard_key:hover { opacity: 0.5; }
.keyboard_key:active { background: #b3d1ff; }

.keyboard_key-wide { width: 12%; }

.keyboard_key-extra-wide 
{
    width: 36%;
    max-width: 486px;
}

.keyboard_key-activatable::after 
{
    content: '';
    top: 10px;
    right: 10px;
    position: absolute;
    width: 8px;
    height: 8px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
}

.keyboard_key-active::after { background: #3399ff; }

.keyboard_key-dark { background: rgba(0, 0, 0, 0.25); }

