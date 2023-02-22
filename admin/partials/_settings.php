<h2><?php esc_attr_e( 'How to get your OpenAI API key ?', 'artist-image-generator' ); ?></h2>
<ol>
    <li>
        <?php esc_attr_e( 'Sign up / Log in into OpenAI developer portail', 'artist-image-generator' ); ?> : 
        <a target="_blank" title="OpenAI Developer Portail" href="https://openai.com/api/">https://openai.com/api/</a>
    </li>
    <li>
        <?php esc_attr_e( 'In User > View API keys, create a new secret key', 'artist-image-generator' ); ?> :
        <a target="_blank" title="OpenAI - API keys" href="https://platform.openai.com/account/api-keys">https://platform.openai.com/account/api-keys</a>
    </li>
    <li>
        <?php esc_attr_e( 'Copy and paste the new secret key in the OPENAI_API_KEY field right here.', 'artist-image-generator' ); ?> 
    </li>
    <li>
        <?php esc_attr_e( 'Press "Save changes" and you are done.', 'artist-image-generator' ); ?> 
    </li>
</ol>
<?php settings_errors(); ?>
<form method="post" action="options.php">
    <?php
        settings_fields( $this->prefix.'_option_group' );
        do_settings_sections( $this->prefix.'-admin' );
        submit_button();
    ?>
</form>