<?php

/**
 * KatanaWP Demo theme — fallback template.
 */

declare(strict_types=1);

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <header>
        <h1><?php bloginfo('name'); ?></h1>
        <?php
        if (has_nav_menu('primary')) {
            wp_nav_menu([
                'theme_location' => 'primary',
                'container' => 'nav',
            ]);
        }
        ?>
    </header>

    <main>
        <?php if (have_posts()) : ?>
            <?php while (have_posts()) :
                the_post(); ?>
                <article <?php post_class(); ?>>
                    <h2><?php the_title(); ?></h2>
                    <?php the_content(); ?>
                </article>
            <?php endwhile; ?>
        <?php else : ?>
            <p>No posts found.</p>
        <?php endif; ?>
    </main>

    <?php wp_footer(); ?>
</body>
</html>
